'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

export interface AutocompleteOption {
  id: number;
  name: string;
}

interface PageResult {
  data: AutocompleteOption[];
  totalPages: number;
}

interface Props {
  queryKey: string;
  fetcher: (page: number, search: string) => Promise<PageResult>;
  value: AutocompleteOption | null;
  onChange: (option: AutocompleteOption | null) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function Autocomplete({
  queryKey,
  fetcher,
  value,
  onChange,
  placeholder = 'Buscar...',
  required,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: [queryKey, 'autocomplete', search],
    queryFn: ({ pageParam = 1 }) => fetcher(pageParam as number, search),
    getNextPageParam: (lastPage, allPages) =>
      allPages.length < lastPage.totalPages ? allPages.length + 1 : undefined,
    initialPageParam: 1,
  });

  const options = data?.pages.flatMap((p) => p.data) ?? [];

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.addEventListener('scroll', handleScroll);
    return () => { if (el) el.removeEventListener('scroll', handleScroll); };
  }, [handleScroll, open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (option: AutocompleteOption) => {
    onChange(option);
    setSearch('');
    setOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setSearch('');
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    setOpen(true);
    setSearch('');
  };

  const inputClass =
    'h-10 w-full rounded-lg border border-gray-300 bg-white px-3 pr-8 text-sm text-gray-700 shadow-theme-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300';

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        className={`${inputClass} ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
        placeholder={placeholder}
        value={open ? search : (value?.name ?? '')}
        onFocus={disabled ? undefined : handleFocus}
        onChange={(e) => setSearch(e.target.value)}
        required={required && !value}
        readOnly={disabled}
        disabled={disabled}
      />

      {value && !open && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          ✕
        </button>
      )}

      {open && (
        <ul
          ref={listRef}
          className="absolute z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
        >
          {options.length === 0 && !isFetchingNextPage ? (
            <li className="px-3 py-2 text-sm text-gray-400">Nenhum resultado.</li>
          ) : (
            options.map((opt) => (
              <li
                key={opt.id}
                onMouseDown={() => handleSelect(opt)}
                className={`cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/[0.05] ${
                  value?.id === opt.id
                    ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {opt.name}
              </li>
            ))
          )}
          {isFetchingNextPage && (
            <li className="px-3 py-2 text-sm text-gray-400">Carregando...</li>
          )}
        </ul>
      )}
    </div>
  );
}
