import React from 'react';

export interface SidebarItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
}

export interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
}

export interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface FilterOption {
  key: string;
  label: string;
  options: SelectOption[];
}