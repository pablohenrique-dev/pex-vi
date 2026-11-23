import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, layout, spacing } from '@/constants/theme';
import { formatDate, parseLocalDate, toIsoDate, todayIso } from '@/features/lots/domain';
import { lotFormSchema, quantityToNumber, type LotFormValues } from '@/features/lots/schema';
import { LOT_UNITS, UNIT_LABELS, type LotInput, type LotUnit } from '@/features/lots/types';

import { Button } from './ui/button';

type LotFormProps = {
  initialValues?: LotInput;
  submitLabel: string;
  loading?: boolean;
  onSubmit: (input: LotInput) => Promise<void> | void;
};

function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

function FieldError({ message }: { message?: string }) {
  return message ? <Text style={styles.errorText}>{message}</Text> : null;
}

function TextField({
  value,
  onChangeText,
  onBlur,
  label,
  placeholder,
  error,
  keyboardType,
  autoCapitalize = 'sentences',
}: {
  value: string;
  onChangeText: (value: string) => void;
  onBlur: () => void;
  label: string;
  placeholder: string;
  error?: string;
  keyboardType?: 'default' | 'decimal-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldGroup}>
      <FieldLabel>{label}</FieldLabel>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        onBlur={() => {
          setFocused(false);
          onBlur();
        }}
        onFocus={() => setFocused(true)}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={[styles.input, focused && styles.inputFocused, error && styles.inputError]}
      />
      <FieldError message={error} />
    </View>
  );
}

function DateField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);

  const handleChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setOpen(false);
    if (selected) onChange(toIsoDate(selected));
  };

  return (
    <View style={styles.fieldGroup}>
      <FieldLabel>{label}</FieldLabel>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${formatDate(value)}`}
        accessibilityHint="Abre o seletor de data"
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.dateButton, error && styles.inputError, pressed && styles.dateButtonPressed]}>
        <MaterialCommunityIcons name="calendar-month-outline" size={22} color={colors.primary} />
        <Text style={styles.dateText}>{formatDate(value)}</Text>
        <MaterialCommunityIcons name="chevron-down" size={20} color={colors.muted} />
      </Pressable>
      <FieldError message={error} />
      {open ? (
        <DateTimePicker
          value={parseLocalDate(value)}
          mode="date"
          display="default"
          onChange={handleChange}
          locale="pt-BR"
        />
      ) : null}
    </View>
  );
}

export function LotForm({ initialValues, submitLabel, loading, onSubmit }: LotFormProps) {
  const defaultDate = todayIso();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LotFormValues>({
    resolver: zodResolver(lotFormSchema),
    defaultValues: initialValues
      ? {
          productName: initialValues.productName,
          lotCode: initialValues.lotCode,
          quantity: String(initialValues.quantity).replace('.', ','),
          unit: initialValues.unit,
          manufactureDate: initialValues.manufactureDate,
          expiryDate: initialValues.expiryDate,
        }
      : {
          productName: '',
          lotCode: '',
          quantity: '1',
          unit: 'un',
          manufactureDate: defaultDate,
          expiryDate: defaultDate,
        },
    mode: 'onBlur',
  });

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      productName: values.productName.trim(),
      lotCode: values.lotCode.trim(),
      quantity: quantityToNumber(values.quantity),
      unit: values.unit,
      manufactureDate: values.manufactureDate,
      expiryDate: values.expiryDate,
    });
  });

  return (
    <View style={styles.form}>
      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Identificação</Text>
          <Text style={styles.sectionHint}>Use o código impresso na embalagem para diferenciar os lotes.</Text>
        </View>
        <Controller
          control={control}
          name="productName"
          render={({ field }) => (
            <TextField
              label="Produto"
              placeholder="Ex.: Leite integral"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.productName?.message}
              autoCapitalize="words"
            />
          )}
        />
        <Controller
          control={control}
          name="lotCode"
          render={({ field }) => (
            <TextField
              label="Código do lote"
              placeholder="Ex.: LT-2026-08"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.lotCode?.message}
              autoCapitalize="characters"
            />
          )}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Estoque</Text>
          <Text style={styles.sectionHint}>Informe a quantidade atual deste lote.</Text>
        </View>
        <Controller
          control={control}
          name="quantity"
          render={({ field }) => (
            <TextField
              label="Quantidade"
              placeholder="Ex.: 12"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.quantity?.message}
              keyboardType="decimal-pad"
              autoCapitalize="none"
            />
          )}
        />
        <Controller
          control={control}
          name="unit"
          render={({ field }) => (
            <View style={styles.fieldGroup}>
              <FieldLabel>Unidade de medida</FieldLabel>
              <View style={styles.unitGrid}>
                {LOT_UNITS.map((unit) => {
                  const selected = field.value === unit;
                  return (
                    <Pressable
                      key={unit}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selected }}
                      onPress={() => field.onChange(unit as LotUnit)}
                      style={({ pressed }) => [
                        styles.unitButton,
                        selected && styles.unitButtonSelected,
                        pressed && styles.unitButtonPressed,
                      ]}>
                      <Text style={[styles.unitText, selected && styles.unitTextSelected]}>{UNIT_LABELS[unit]}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Datas</Text>
          <Text style={styles.sectionHint}>A validade permanece válida até o fim do dia informado.</Text>
        </View>
        <Controller
          control={control}
          name="manufactureDate"
          render={({ field }) => (
            <DateField
              label="Data de fabricação"
              value={field.value}
              onChange={field.onChange}
              error={errors.manufactureDate?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="expiryDate"
          render={({ field }) => (
            <DateField
              label="Data de validade"
              value={field.value}
              onChange={field.onChange}
              error={errors.expiryDate?.message}
            />
          )}
        />
      </View>

      <Button
        label={submitLabel}
        loading={loading}
        onPress={() => submit()}
        icon={<MaterialCommunityIcons name="content-save-outline" color={colors.white} size={21} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.xl, paddingBottom: spacing.xxl },
  section: { gap: spacing.lg },
  sectionHeading: { gap: spacing.xs },
  sectionTitle: { color: colors.ink, fontSize: 19, lineHeight: 24, fontWeight: '700' },
  sectionHint: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  fieldGroup: { gap: spacing.sm },
  fieldLabel: { color: colors.ink, fontSize: 14, lineHeight: 20, fontWeight: '700' },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    color: colors.ink,
    fontSize: 16,
  },
  inputFocused: { borderColor: colors.primary, borderWidth: 2, paddingHorizontal: spacing.lg - 1 },
  inputError: { borderColor: colors.danger },
  errorText: { color: colors.danger, fontSize: 13, lineHeight: 18, fontWeight: '600' },
  dateButton: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  dateButtonPressed: { backgroundColor: colors.surface },
  dateText: { flex: 1, color: colors.ink, fontSize: 16, lineHeight: 22, fontWeight: '600' },
  unitGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  unitButton: {
    minHeight: layout.touchTarget,
    borderRadius: 999,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceStrong,
  },
  unitButtonSelected: { backgroundColor: colors.primary },
  unitButtonPressed: { opacity: 0.78 },
  unitText: { color: colors.ink, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  unitTextSelected: { color: colors.white },
});
