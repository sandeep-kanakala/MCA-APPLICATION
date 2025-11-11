'use client';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';

interface Option {
  label: string;
  value: string;
}

interface ReusableSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  options: string[] | Option[];
  fieldName?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  searchable?: boolean;
  excludeValues?: string[];
  isEditing?: boolean;
}

export default function ReusableSelect({
  value,
  onChange,
  options,
  fieldName,
  placeholder,
  disabled = false,
  className = '',
  searchable = false,
  excludeValues = [],
  isEditing = false,
}: ReusableSelectProps) {
  const [open, setOpen] = useState(false);
  const normalizedOptions: Option[] = useMemo(() => {
    if (!options?.length) return [];

    const normalized =
      typeof options[0] === 'string'
        ? (options as string[]).map((opt) => ({
            label: opt.charAt(0).toUpperCase() + opt.slice(1).toLowerCase(),
            value: opt,
          }))
        : (options as Option[]);
    return normalized.filter((opt) => !excludeValues.includes(opt.value));
  }, [options, excludeValues]);
  useEffect(() => {
    setOpen(isEditing);
  }, [isEditing]);
  const placeholderText =
    placeholder ||
    (fieldName
      ? `Select ${fieldName.charAt(0).toUpperCase() + fieldName.slice(1).toLowerCase()}`
      : 'Select an option');

  if (!searchable) {
    return (
      <Select
        value={value}
        onValueChange={(val) => onChange?.(val === 'none' ? '' : val)}
        disabled={disabled}
      >
        <SelectTrigger autoFocus className={cn('w-full cursor-pointer', className)}>
          <SelectValue placeholder={placeholderText} />
        </SelectTrigger>
        <SelectContent position="popper">
          {normalizedOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="cursor-pointer">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
  const selectedLabel = normalizedOptions.find((opt) => opt.value === value)?.label || '';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'w-full justify-between rounded-md border px-3 py-2 text-sm text-left',
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            className,
          )}
          disabled={disabled}
        >
          {selectedLabel || placeholderText}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup className="max-h-60 overflow-y-auto">
            {' '}
            {normalizedOptions.map((opt) => (
              <CommandItem
                className="cursor-pointer"
                key={opt.value}
                onSelect={() => {
                  onChange?.(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
