/** Convert DB ingredient name ("Bone_Shards", "Forget-Me-Lots") to display form ("Bone Shards", "Forget-Me-Lots"). */
export function formatIngredientName(name: string): string {
  return name.replace(/_/g, " ");
}
