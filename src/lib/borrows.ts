import { supabase } from "./supabaseClient";

export type BorrowRow = {
  id: string;
  book_id: string;
  borrowed_by: string;
  borrowed_at: string;
  returned_at: string | null;
};

export async function fetchActiveBorrow(
  bookId: string
): Promise<BorrowRow | null> {
  const { data, error } = await supabase
    .from("borrows")
    .select("id,book_id,borrowed_by,borrowed_at,returned_at")
    .eq("book_id", bookId)
    .is("returned_at", null)
    .maybeSingle();

  if (error) throw error;
  return (data as BorrowRow) ?? null;
}

export async function checkoutBook(bookId: string, userId: string) {
  // 1) create borrow record
  const { error: e1 } = await supabase.from("borrows").insert({
    book_id: bookId,
    borrowed_by: userId,
  });
  if (e1) throw e1;

  // 2) mark book as borrowed
  const { error: e2 } = await supabase
    .from("books")
    .update({ status: "borrowed" })
    .eq("id", bookId);
  if (e2) throw e2;
}

export async function returnBook(bookId: string, borrowId: string) {
  // 1) close borrow record
  const { error: e1 } = await supabase
    .from("borrows")
    .update({ returned_at: new Date().toISOString() })
    .eq("id", borrowId);
  if (e1) throw e1;

  // 2) mark book as available
  const { error: e2 } = await supabase
    .from("books")
    .update({ status: "available" })
    .eq("id", bookId);
  if (e2) throw e2;
}
