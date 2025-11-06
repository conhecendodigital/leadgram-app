'use client'

import { LayoutGrid, List } from 'lucide-react'

export default function ContentFilters() {
  return (
    <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
      <button className="p-2 bg-white rounded-lg shadow-sm">
        <LayoutGrid className="w-5 h-5 text-gray-700" />
      </button>
      <button className="p-2 hover:bg-white rounded-lg transition-colors">
        <List className="w-5 h-5 text-gray-400" />
      </button>
    </div>
  )
}
