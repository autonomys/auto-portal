import { describe, it, expect } from 'vitest';
import {
  applySemanticColors,
  applyStatusColor,
  applyOperatorStatusColors,
  applyTransactionStatusColors,
  applyValidationColors,
  applyWalletStatusColors,
  createAlertClasses,
  createStatusBadge,
  createSemanticButton,
  createValidatedInput,
  createStatusDot,
  isPositiveSemanticColor,
  isNegativeSemanticColor,
  statusToSemanticColor,
} from '../color-utils';

describe('color-utils', () => {
  describe('applySemanticColors', () => {
    it('applies default background variant', () => {
      const cls = applySemanticColors('success');
      expect(cls).toBe('bg-success-50');
    });

    it('applies text variant with additional classes', () => {
      const cls = applySemanticColors('error', 'text', 'font-bold');
      expect(cls).toBe('text-error-800 font-bold');
    });
  });

  describe('applyStatusColor', () => {
    it('applies status color string with additional classes', () => {
      const cls = applyStatusColor('active', 'custom-class');
      expect(cls).toBe('text-status-active custom-class');
    });
  });

  describe('applyOperatorStatusColors', () => {
    it('applies text variant by default', () => {
      const cls = applyOperatorStatusColors('active');
      expect(cls).toBe('text-success-700');
    });

    it('applies dot variant', () => {
      const cls = applyOperatorStatusColors('slashed', 'dot');
      expect(cls).toBe('bg-error-500');
    });
  });

  describe('applyTransactionStatusColors', () => {
    it('applies badge variant for pending status', () => {
      const cls = applyTransactionStatusColors('pending', 'badge');
      expect(cls).toBe('bg-warning-100 text-warning-800 border-warning-200');
    });
  });

  describe('applyValidationColors', () => {
    it('applies border variant for valid and invalid states', () => {
      expect(applyValidationColors('valid', 'border')).toBe('border-success-300');
      expect(applyValidationColors('invalid', 'border')).toBe('border-error-300');
      expect(applyValidationColors('neutral', 'border')).toBe('border-neutral-300');
    });
  });

  describe('applyWalletStatusColors', () => {
    it('applies button variant for connected wallet', () => {
      const cls = applyWalletStatusColors('connected', 'button');
      expect(cls).toBe('bg-success-500 hover:bg-success-600 text-white');
    });
  });

  describe('createAlertClasses', () => {
    it('combines alert box base classes with semantic theme', () => {
      const cls = createAlertClasses('info');
      expect(cls).toContain('px-4 py-3 rounded-md border');
      expect(cls).toContain('bg-info-50');
      expect(cls).toContain('border-info-200');
      expect(cls).toContain('text-info-800');
    });
  });

  describe('createStatusBadge', () => {
    it('creates badge for operator status', () => {
      const cls = createStatusBadge('active', 'sm');
      expect(cls).toContain('inline-flex items-center rounded-full border font-medium');
      expect(cls).toContain('px-2 py-1 text-xs');
      expect(cls).toContain('bg-success-100 text-success-800 border-success-200');
    });

    it('creates badge for transaction status', () => {
      const cls = createStatusBadge('confirmed', 'lg');
      expect(cls).toContain('px-4 py-2 text-base');
      expect(cls).toContain('bg-success-100 text-success-800 border-success-200');
    });
  });

  describe('createSemanticButton', () => {
    it('creates solid button classes', () => {
      const cls = createSemanticButton('success', 'solid', 'md');
      expect(cls).toContain('inline-flex items-center justify-center rounded-md font-medium');
      expect(cls).toContain('px-4 py-2 text-sm');
      expect(cls).toContain('bg-success-500 text-white hover:bg-success-600');
    });

    it('creates outline button classes with hover states', () => {
      const cls = createSemanticButton('warning', 'outline', 'sm');
      expect(cls).toContain('bg-transparent');
      expect(cls).toContain('border');
      expect(cls).toContain('hover:bg-warning-50');
    });
  });

  describe('createValidatedInput', () => {
    it('creates neutral input classes', () => {
      const cls = createValidatedInput('neutral');
      expect(cls).toContain('rounded-md border');
      expect(cls).toContain('border-neutral-300');
    });

    it('creates invalid input classes with tinted background', () => {
      const cls = createValidatedInput('invalid');
      expect(cls).toContain('border-error-300');
      expect(cls).toContain('bg-error-50');
    });
  });

  describe('createStatusDot', () => {
    it('creates status dot with size classes', () => {
      const cls = createStatusDot('active', 'sm');
      expect(cls).toContain('rounded-full');
      expect(cls).toContain('w-2 h-2');
      expect(cls).toContain('bg-success-500');
    });
  });

  describe('isPositiveSemanticColor and isNegativeSemanticColor', () => {
    it('correctly categorizes positive semantic colors', () => {
      expect(isPositiveSemanticColor('success')).toBe(true);
      expect(isPositiveSemanticColor('info')).toBe(true);
      expect(isPositiveSemanticColor('warning')).toBe(false);
      expect(isPositiveSemanticColor('error')).toBe(false);
    });

    it('correctly categorizes negative semantic colors', () => {
      expect(isNegativeSemanticColor('error')).toBe(true);
      expect(isNegativeSemanticColor('warning')).toBe(true);
      expect(isNegativeSemanticColor('success')).toBe(false);
      expect(isNegativeSemanticColor('info')).toBe(false);
    });
  });

  describe('statusToSemanticColor', () => {
    it('maps StatusColor to matching SemanticColor', () => {
      expect(statusToSemanticColor('active')).toBe('success');
      expect(statusToSemanticColor('inactive')).toBe('info');
      expect(statusToSemanticColor('degraded')).toBe('warning');
      expect(statusToSemanticColor('slashed')).toBe('error');
      expect(statusToSemanticColor('pending')).toBe('warning');
    });
  });
});
