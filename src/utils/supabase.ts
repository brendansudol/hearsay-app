import { createClient } from "@supabase/supabase-js"
import { Database } from "@/types"

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
)

export function getEntry(id: string) {
  return supabase.from("audio").select("*").eq("id", id).single()
}

export async function checkExists(url: string, fingerprint: string) {
  const { data } = await supabase
    .from("audio")
    .select("*")
    .or(`inputUrl.eq.${url},fingerprint.eq.${fingerprint}`)

  return data?.[0] ?? undefined
}
