module.exports = (report) => {
  const result = report.results?.[0] ?? {};
  const input = result.input?.trim() || '(empty commit message)';
  const problems = [...(result.errors ?? []), ...(result.warnings ?? [])];

  if (problems.length === 0) {
    return '';
  }

  return [
    '',
    'Commit message failed linting',
    '',
    `  Received: ${input}`,
    '',
    '  Expected format:',
    '    type(scope): subject',
    '',
    '  Examples:',
    '    feat(auth): add password reset flow',
    '    fix(api): handle missing profile data',
    '    chore: update dependencies',
    '',
    '  Allowed types:',
    '    build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test',
    '',
    '  Problems:',
    ...problems.map((problem) => `    - ${problem.message} [${problem.name}]`),
    '',
  ].join('\n');
};
