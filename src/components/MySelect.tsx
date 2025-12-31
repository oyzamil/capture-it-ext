import { Select, SelectProps } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import React, { useEffect, useRef, useState } from 'react';

interface MySelectProps<T = any> extends SelectProps<T> {
  enableKeyboardNavigation?: boolean;
}

const MySelect = <T extends any = any>({ value, onChange, options = [], enableKeyboardNavigation = true, ...restProps }: MySelectProps<T>) => {
  const [internalValue, setInternalValue] = useState<T | null | undefined>(value);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const selectRef = useRef<any>(null);

  // Sync internal value with external value
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Get flat list of option values
  const getOptionValues = (): any[] => {
    const values: any[] = [];
    options.forEach((option: DefaultOptionType) => {
      if (option.options) {
        // Handle grouped options
        option.options.forEach((subOption: DefaultOptionType) => {
          values.push(subOption.value);
        });
      } else {
        values.push(option.value);
      }
    });
    return values;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!enableKeyboardNavigation) return;

    const optionValues = getOptionValues();
    if (optionValues.length === 0) return;

    const currentIndex = optionValues.findIndex((val) => val === internalValue);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = currentIndex < optionValues.length - 1 ? currentIndex + 1 : 0;
      const nextValue = optionValues[nextIndex];
      setInternalValue(nextValue);

      const selectedOption = options.find((opt: DefaultOptionType) => {
        if (opt.options) {
          return opt.options.find((sub: DefaultOptionType) => sub.value === nextValue);
        }
        return opt.value === nextValue;
      });

      onChange?.(nextValue, selectedOption as any);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : optionValues.length - 1;
      const prevValue = optionValues[prevIndex];
      setInternalValue(prevValue);

      const selectedOption = options.find((opt: DefaultOptionType) => {
        if (opt.options) {
          return opt.options.find((sub: DefaultOptionType) => sub.value === prevValue);
        }
        return opt.value === prevValue;
      });

      onChange?.(prevValue, selectedOption as any);
    }
  };

  const handleChange = (val: T, option?: DefaultOptionType | DefaultOptionType[]) => {
    setInternalValue(val);
    onChange?.(val, option);
  };

  return <Select<T> ref={selectRef} value={internalValue} onChange={handleChange} onOpenChange={setIsOpen} onKeyDown={handleKeyDown} options={options} {...restProps} />;
};

export default MySelect;
