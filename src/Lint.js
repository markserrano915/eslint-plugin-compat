// @flow
import { rules } from './providers';
import type { Node, ESLintNode, Targets, isValidObject } from './LintTypes';

export function generateErrorName(_node: Node): string {
  if (_node.name) return _node.name;
  if (_node.property) return `${_node.object}.${_node.property}()`;
  return _node.object;
}

/**
 * Return false if a if a rule fails
 *
 * TODO: Eventually, targets will default to 'modern', ('chrome@50', safari@8)
 *       See https://github.com/amilajack/eslint-plugin-compat/wiki#release-200
 */
export default function Lint(
  eslintNode: ESLintNode,
  targets: Targets = ['chrome', 'firefox', 'safari', 'edge'],
  polyfills: Set<string>
): isValidObject {
  // Find the corresponding rules for a eslintNode by it's astNodeType
  const failingRule = rules
    .filter(
      (rule: Node): boolean =>
        rule.astNodeType === eslintNode.type &&
        // Check if polyfill is provided
        !polyfills.has(rule.id)
    )
    // Find the first failing rule
    .find((rule: Node): boolean => !rule.isValid(rule, eslintNode, targets));

  return failingRule
    ? {
        rule: failingRule,
        isValid: false,
        unsupportedTargets: failingRule.getUnsupportedTargets(
          failingRule,
          targets
        )
      }
    : {
        rule: {},
        unsupportedTargets: [],
        isValid: true
      };
}
