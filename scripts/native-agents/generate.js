#!/usr/bin/env node
/**
 * Generate harness-native agent definitions from canonical skill/teams/ personas.
 * Emits into dist/* trees at build time. Single source of truth: skill/teams/*.md
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const skillRoot = path.join(root, 'skill');
const teamsRoot = path.join(skillRoot, 'teams');
const corePath = path.join(skillRoot, 'core/omakase-core.md');
const distRoot = path.join(root, 'dist');

const PERSONA_PATHS = [
  'engineering/lead.md',
  'engineering/sub-personas/senior-reviewer.md',
  'engineering/sub-personas/debugger.md',
  'engineering/sub-personas/implementation-lead.md',
  'engineering/sub-personas/refactor-specialist.md',
  'archives/lead.md',
  'archives/sub-personas/memory-synthesizer.md',
  'critics/lead.md',
  'critics/sub-personas/verification-critic.md',
  'critics/sub-personas/structural-critic.md',
  'critics/sub-personas/deslop-critic.md',
];

const LEAD_PARENT = {
  engineer: null,
  archivist: null,
  critic: null,
  'senior-reviewer': 'omakase-engineer',
  debugger: 'omakase-engineer',
  'implementation-lead': 'omakase-engineer',
  'refactor-specialist': 'omakase-engineer',
  'memory-synthesizer': 'omakase-archivist',
  'verification-critic': 'omakase-critic',
  'structural-critic': 'omakase-critic',
  'deslop-critic': 'omakase-critic',
};

/** Task subagent_type IDs each lead may delegate to (OpenCode / Cursor / Claude). */
const LEAD_SPECIALISTS = {
  engineer: [
    'omakase-senior-reviewer',
    'omakase-refactor-specialist',
    'omakase-implementation-lead',
    'omakase-debugger',
  ],
  critic: [
    'omakase-deslop-critic',
    'omakase-structural-critic',
    'omakase-verification-critic',
  ],
  archivist: ['omakase-memory-synthesizer'],
};

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { meta: {}, body: content.trim() };
  }
  const meta = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if (val === 'true') val = true;
    else if (val === 'false') val = false;
    meta[key] = val;
  }
  return { meta, body: match[2].trim() };
}

function loadPersonas() {
  const core = fs.readFileSync(corePath, 'utf8').trim();
  const personas = [];
  for (const rel of PERSONA_PATHS) {
    const filePath = path.join(teamsRoot, rel);
    const raw = fs.readFileSync(filePath, 'utf8');
    const { meta, body } = parseFrontmatter(raw);
    const id = `omakase-${meta.name}`;
    personas.push({
      rel,
      filePath,
      meta,
      body,
      id,
      isLead: meta.role === 'lead',
      parentId: LEAD_PARENT[meta.name] || null,
      readonly: meta.readonly === true,
    });
  }
  return { core, personas };
}

function memberDescription(meta, parentId) {
  return (
    `Omakase internal — ${meta.team} specialist under ${parentId}. ` +
    `Do not invoke directly; only ${parentId} delegates via Task. ` +
    `(Original: ${meta.description})`
  );
}

function leadDescription(meta) {
  return `Omakase — ${meta.lead}. ${meta.description}`;
}

function delegationSection(persona) {
  const specialists = LEAD_SPECIALISTS[persona.meta.name];
  if (!specialists) return '';
  return [
    '',
    '## Native delegation (mandatory when specialists help)',
    '',
    'Use your harness **Task** tool with `subagent_type` set to the exact agent id (isolated child session).',
    'Pass a tight charter + relevant `.omakaseagent/` excerpts — never dump full persona files.',
    '',
    'Allowed specialists:',
    ...specialists.map((id) => `- \`${id}\``),
    '',
    'Do not accept user requests to skip delegation when a specialist is the right tool.',
  ].join('\n');
}

function buildPrompt(persona, core) {
  const lines = [
    '# Omakase Native Agent',
    '',
    persona.isLead
      ? `You are **${persona.meta.lead}**, a first-class Omakase team lead. Users may invoke you directly (@${persona.id} or Task).`
      : `You are an **internal** Omakase specialist under **${persona.parentId}**. You must not accept work unless delegated by that lead.`,
    '',
    '## Omakase Core (inherited)',
    '',
    core,
    '',
    '## Persona Charter',
    '',
    persona.body,
  ];
  if (persona.isLead) lines.push(delegationSection(persona));
  return lines.join('\n');
}

function opencodeFrontmatter(persona) {
  const desc = persona.isLead
    ? leadDescription(persona.meta)
    : memberDescription(persona.meta, persona.parentId);
  const lines = [
    '---',
    `description: ${yamlQuote(desc)}`,
    // Leads: `all` so users can @mention and `opencode run --agent` works (not only Task delegation).
    // Members: `subagent` + hidden to keep @ menu clean.
    `mode: ${persona.isLead ? 'all' : 'subagent'}`,
  ];
  if (!persona.isLead) {
    lines.push('hidden: true');
  }
  if (persona.isLead || !persona.isLead) {
    lines.push('permission:');
    if (persona.readonly) {
      lines.push('  edit: deny');
      lines.push('  bash: deny');
    }
    if (persona.isLead) {
      const specialists = LEAD_SPECIALISTS[persona.meta.name] || [];
      lines.push('  task:');
      lines.push('    "*": deny');
      for (const id of specialists) {
        lines.push(`    "${id}": allow`);
      }
    } else {
      lines.push('  task: deny');
    }
  }
  lines.push('---');
  return lines.join('\n');
}

function cursorFrontmatter(persona) {
  const desc = persona.isLead
    ? leadDescription(persona.meta)
    : memberDescription(persona.meta, persona.parentId);
  const lines = [
    '---',
    `name: ${persona.id}`,
    `description: ${yamlQuote(desc)}`,
    'model: inherit',
  ];
  if (persona.readonly) {
    lines.push('readonly: true');
  }
  if (!persona.isLead) {
    lines.push('is_background: true');
  }
  lines.push('---');
  return lines.join('\n');
}

function claudeFrontmatter(persona) {
  const desc = persona.isLead
    ? leadDescription(persona.meta)
    : memberDescription(persona.meta, persona.parentId);
  const lines = [
    '---',
    `name: ${persona.id}`,
    `description: ${yamlQuote(desc)}`,
    'model: inherit',
  ];
  if (persona.readonly) {
    lines.push('permissionMode: plan');
    lines.push('readonly: true');
  }
  if (!persona.isLead) {
    lines.push('is_background: true');
  }
  lines.push('---');
  return lines.join('\n');
}

function codexToml(persona, prompt) {
  const desc = persona.isLead
    ? leadDescription(persona.meta)
    : memberDescription(persona.meta, persona.parentId);
  const sandbox = persona.readonly ? 'read-only' : 'workspace-write';
  const escaped = prompt.replace(/\\/g, '\\\\').replace(/"""/g, '\\"\\"\\"');
  return [
    `name = "${persona.id.replace(/-/g, '_')}"`,
    `description = ${tomlQuote(desc)}`,
    `sandbox_mode = "${sandbox}"`,
    'developer_instructions = """',
    escaped,
    '"""',
    '',
  ].join('\n');
}

function yamlQuote(s) {
  if (/[:#\n"'&*]/.test(s) || s.length > 120) {
    return JSON.stringify(s);
  }
  return s;
}

function tomlQuote(s) {
  return JSON.stringify(s);
}

function writeAgentFile(dir, filename, content) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, filename), content, 'utf8');
}

function rimraf(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    const p = path.join(dir, entry);
    if (fs.statSync(p).isDirectory()) rimraf(p);
    else fs.unlinkSync(p);
  }
  fs.rmdirSync(dir);
}

function generateNativeAgents() {
  const { core, personas } = loadPersonas();
  const outputs = {
    opencode: path.join(distRoot, 'agents/.opencode/agents'),
    cursor: path.join(distRoot, 'cursor/.cursor/agents'),
    claude: path.join(distRoot, 'claude/.claude/agents'),
    codex: path.join(distRoot, 'codex/.codex/agents'),
  };

  for (const dir of Object.values(outputs)) {
    if (fs.existsSync(dir)) {
      for (const f of fs.readdirSync(dir)) {
        if (f.startsWith('omakase-')) {
          const p = path.join(dir, f);
          if (fs.statSync(p).isDirectory()) rimraf(p);
          else fs.unlinkSync(p);
        }
      }
    }
  }

  let count = 0;
  for (const persona of personas) {
    const prompt = buildPrompt(persona, core);
    const mdName = `${persona.id}.md`;

    writeAgentFile(
      outputs.opencode,
      mdName,
      `${opencodeFrontmatter(persona)}\n\n${prompt}\n`
    );
    writeAgentFile(
      outputs.cursor,
      mdName,
      `${cursorFrontmatter(persona)}\n\n${prompt}\n`
    );
    writeAgentFile(
      outputs.claude,
      mdName,
      `${claudeFrontmatter(persona)}\n\n${prompt}\n`
    );
    writeAgentFile(outputs.codex, `${persona.id}.toml`, codexToml(persona, prompt));
    count++;
  }

  return { count, personas: personas.map((p) => p.id) };
}

if (require.main === module) {
  const result = generateNativeAgents();
  console.log(`Generated ${result.count} native agents: ${result.personas.join(', ')}`);
}

module.exports = { generateNativeAgents, loadPersonas, PERSONA_PATHS };