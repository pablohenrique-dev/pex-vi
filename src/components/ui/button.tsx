import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { colors, layout, spacing } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: ReactNode;
};

const variantStyles = {
  primary: { background: colors.primary, pressed: colors.primaryPressed, text: colors.white },
  secondary: { background: colors.primarySoft, pressed: colors.surfaceStrong, text: colors.primaryPressed },
  ghost: { background: 'transparent', pressed: colors.surface, text: colors.primary },
  danger: { background: colors.danger, pressed: '#8D1C13', text: colors.white },
} as const;

export function Button({ label, variant = 'primary', loading, icon, disabled, ...props }: ButtonProps) {
  const palette = variantStyles[variant];
  const isDisabled = Boolean(disabled || loading);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      {...props}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: pressed ? palette.pressed : palette.background },
        isDisabled && styles.disabled,
      ]}>
      {loading ? <ActivityIndicator color={palette.text} /> : icon}
      <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: layout.touchTarget,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  label: { fontSize: 16, lineHeight: 22, fontWeight: '700' },
  disabled: { opacity: 0.55 },
});
