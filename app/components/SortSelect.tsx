'use client';

import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';

interface SortOption<T> {
  value: T;
  label: string;
  icon?: 'none' | 'up' | 'down';
}

interface SortSelectProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SortOption<T>[];
  label?: string;
  id?: string;
}

const ArrowUpIcon = () => (
  <svg className="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
      clipRule="evenodd"
    />
  </svg>
);

const ArrowDownIcon = () => (
  <svg className="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z"
      clipRule="evenodd"
    />
  </svg>
);

const DashIcon = () => (
  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
  </svg>
);

export default function SortSelect<T extends string>({
  value,
  onChange,
  options,
  label,
  id,
}: SortSelectProps<T>) {
  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  const renderIcon = (icon?: 'none' | 'up' | 'down') => {
    if (icon === 'up') return <ArrowUpIcon />;
    if (icon === 'down') return <ArrowDownIcon />;
    return <DashIcon />;
  };

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-medium text-slate-700 mb-1">
          {label}
        </label>
      )}
      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-slate-300 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 hover:border-slate-400 transition-colors">
            <span className="flex items-center gap-2">
              {renderIcon(selectedOption.icon)}
              <span>{selectedOption.label}</span>
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <svg
                className="h-5 w-5 text-slate-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  value={option.value}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-3 pr-9 ${
                      active ? 'bg-cyan-50 text-cyan-900' : 'text-slate-900'
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span className="flex items-center gap-2">
                        {renderIcon(option.icon)}
                        <span className={selected ? 'font-semibold' : 'font-normal'}>
                          {option.label}
                        </span>
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-cyan-600">
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
