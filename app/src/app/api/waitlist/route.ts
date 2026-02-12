import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.from("waitlist").insert({ email });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ message: "Já estás na lista!" }, { status: 200 });
      }
      return NextResponse.json({ error: "Erro ao guardar" }, { status: 500 });
    }

    return NextResponse.json({ message: "Adicionado à lista de espera!" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
