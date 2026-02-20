import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wbnvoohnthwdxbfgpyig.supabase.co'
const supabaseKey = 'sb_publishable_Q75DXlWiM87ZjFSnCU92xg_0lHSNJGw'

export const supabase = createClient(supabaseUrl, supabaseKey)
