import { Priority } from '@prisma/client'
export interface TodoFormData {
  title: string
  description: string
  priority: Priority
  nameId: string
  link: string
}
export const handleFormSubmit = async (
  formData: TodoFormData,
  initialData: any,
  onSubmit: (data: TodoFormData) => Promise<void>
) => {
  try {
    await onSubmit(formData)
  } catch (error) {
    console.error('Error submitting form:', error)
  }
}
export const handleInputChange = (
  field: keyof TodoFormData,
  value: string | Priority,
  setFormData: (data: any) => void,
  currentFormData: TodoFormData
) => {
  setFormData({
    ...currentFormData,
    [field]: value,
  })
}
export const handleCreateName = async (
  label: string,
  onCreateName: (label: string) => Promise<void>
) => {
  try {
    await onCreateName(label)
  } catch (error) {
    console.error('Error creating name:', error)
  }
}