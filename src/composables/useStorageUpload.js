import { getSupabase } from '../lib/supabase.js'

export function useStorageUpload() {
  async function uploadImage(projectId, file) {
    const supabase = getSupabase()
    const path = `projects/${projectId}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('project-assets').upload(path, file)
    if (error) throw error
    const { data } = supabase.storage.from('project-assets').getPublicUrl(path)
    return data.publicUrl
  }

  return { uploadImage }
}
