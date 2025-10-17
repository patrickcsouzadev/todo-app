import React from 'react'
interface NameLabelProps {
  name?: { id: string; label: string } | null
}
export function NameLabel({ name }: NameLabelProps) {
  return (
    <span className="text-sm text-gray-300">
      {name && name.label ? name.label : 'Autor removido'}
    </span>
  )
}
export default NameLabel