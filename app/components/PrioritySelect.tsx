'use client';

import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { Priority } from '@/types';

interface PriorityOption {
  value: Priority | undefined;
  label: string;
  color: string;
}

const priorityOptions: PriorityOption[] = [
  { value: undefined, label: 'None', color: 'bg-slate-400' },
  { value: 'low', label: 'Low', color: 'bg-green-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-red-500' },
];

interface PrioritySelectProps {
  value: Priority | undefined;
  onChange: (value: Priority | undefined) => void;
  label?: string;
  id?: string;
}

export default function PrioritySelect({ value, onChange, label, id }: PrioritySelectProps) {
  const selectedOption = priorityOptions.find((opt) => opt.value === value) || priorityOptions[0];

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
              <span className={`w-2 h-2 rounded-full ${selectedOption.color}`} />
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
              {priorityOptions.map((option) => (
                <Listbox.Option
                  key={option.label}
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
                        <span className={`w-2 h-2 rounded-full ${option.color}`} />
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
