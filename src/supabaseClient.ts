import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kjffoiwyyctadxlieaay.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZmZvaXd5eWN0YWR4bGllYWF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTMzODExMTYsImV4cCI6MTk2ODk1NzExNn0.vP1NnhHg3becW7KQDmbmKXetCdBZK7ArIqWvjnoQmWs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)