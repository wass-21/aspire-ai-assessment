import { supabase } from "./supabaseClient";

export type Book = {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  tags: string[] | null;
  summary: string | null;
  status: "available" | "borrowed";
  created_at: string;
};

export async function fetchBooks(search?: string): Promise<Book[]> {
  let query = supabase
    .from("books")
    .select("id,title,author,isbn,tags,summary,status,created_at")
    .order("created_at", { ascending: false });

  if (search && search.trim().length > 0) {
    const s = search.trim();
    // basic search (title OR author)
    query = query.or(`title.ilike.%${s}%,author.ilike.%${s}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Book[];
}
