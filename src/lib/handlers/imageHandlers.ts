export function handleImageError(
  imageUrl: string,
  element: HTMLImageElement
) {
  console.error('Erro ao carregar imagem:', imageUrl)
  element.style.display = 'none'
}
export function handleImageLoadError(imageUrl: string) {
  return (e: React.SyntheticEvent<HTMLImageElement>) => {
    handleImageError(imageUrl, e.currentTarget)
  }
}