import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { MessageCircle, Pencil, Plus, Search, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { parseCsv, parseDate } from "@/lib/csv";
import { useClientMutations, useClients, useMyStore } from "@/lib/db";
import { formatDate, onlyDigits } from "@/lib/format";

export const Route = createFileRoute("/dashboard/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes — EasyManager" },
      {
        name: "description",
        content:
          "Cadastre e importe sua base de clientes e fale com cada um pelo WhatsApp em um toque.",
      },
    ],
  }),
  component: ClientesPage,
});

type ClientForm = {
  id?: string;
  name: string;
  phone: string;
  address: string;
  birth_date: string;
  notes: string;
};

const emptyForm: ClientForm = { name: "", phone: "", address: "", birth_date: "", notes: "" };

function ClientesPage() {
  const { data: store } = useMyStore();
  const { data: clients = [] } = useClients(store?.id);
  const mutations = useClientMutations(store?.id);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<ClientForm | null>(null);
  const csvRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () =>
      clients.filter(
        (c) =>
          !query.trim() ||
          `${c.name} ${c.phone}`.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [clients, query],
  );

  const save = async () => {
    if (!editing || !store) return;
    if (!editing.name.trim()) {
      toast.error("Informe o nome do cliente");
      return;
    }
    try {
      await mutations.save.mutateAsync({
        ...(editing.id ? { id: editing.id } : {}),
        store_id: store.id,
        name: editing.name.trim(),
        phone: onlyDigits(editing.phone),
        address: editing.address,
        birth_date: editing.birth_date || null,
        notes: editing.notes,
      });
      toast.success(editing.id ? "Cliente atualizado" : "Cliente cadastrado");
      setEditing(null);
    } catch {
      toast.error("Não foi possível salvar o cliente");
    }
  };

  const importCsv = async (file: File) => {
    const rows = parseCsv(await file.text());
    const payload = rows
      .filter((r) => (r["nome"] ?? "").trim())
      .map((r) => ({
        name: r["nome"]!.trim(),
        phone: onlyDigits(r["telefone"] ?? r["whatsapp"] ?? ""),
        address: r["endereco"] ?? "",
        birth_date: parseDate(r["nascimento"] ?? r["data_nascimento"]),
        notes: r["observacoes"] ?? "",
      }));
    if (!payload.length) {
      toast.error("CSV vazio ou sem a coluna 'nome'");
      return;
    }
    try {
      const count = await mutations.bulkInsert.mutateAsync(payload);
      toast.success(`${count} clientes importados`);
    } catch {
      toast.error("Falha ao importar o CSV");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Clientes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sua base para campanhas, aniversários e recompra.
        </p>
      </div>

      <section className="surface-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold">Base ({clients.length})</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => csvRef.current?.click()}>
              <Upload className="size-4" />
              Importar CSV
            </Button>
            <input
              ref={csvRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void importCsv(file);
                e.target.value = "";
              }}
            />
            <Button onClick={() => setEditing({ ...emptyForm })}>
              <Plus className="size-4" />
              Novo cliente
            </Button>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          CSV com colunas: nome, telefone, endereco, nascimento, observacoes.
        </p>

        <div className="relative mt-4">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome ou telefone..."
            className="pl-9"
          />
        </div>

        <div className="mt-4 grid gap-3">
          {filtered.map((c) => (
            <article
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  {c.phone || "sem telefone"}
                  {c.birth_date ? ` · aniversário ${formatDate(c.birth_date)}` : ""}
                </p>
                {c.address && (
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{c.address}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="outline" asChild disabled={!c.phone} aria-label="Chamar no WhatsApp">
                  <a
                    href={`https://wa.me/${c.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="size-4" />
                  </a>
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Editar cliente"
                  onClick={() =>
                    setEditing({
                      id: c.id,
                      name: c.name,
                      phone: c.phone,
                      address: c.address,
                      birth_date: c.birth_date ?? "",
                      notes: c.notes,
                    })
                  }
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => mutations.remove.mutate(c.id)}
                  aria-label="Remover cliente"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </article>
          ))}
          {filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nenhum cliente cadastrado ainda.
            </p>
          )}
        </div>
      </section>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar cliente" : "Novo cliente"}</DialogTitle>
            <DialogDescription>Dados usados nas suas campanhas de WhatsApp.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="c-name">Nome</Label>
                <Input
                  id="c-name"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="c-phone">WhatsApp</Label>
                  <Input
                    id="c-phone"
                    value={editing.phone}
                    onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                    placeholder="5511999999999"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="c-birth">Nascimento</Label>
                  <Input
                    id="c-birth"
                    type="date"
                    value={editing.birth_date}
                    onChange={(e) => setEditing({ ...editing, birth_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="c-address">Endereço</Label>
                <Input
                  id="c-address"
                  value={editing.address}
                  onChange={(e) => setEditing({ ...editing, address: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="c-notes">Observações</Label>
                <Textarea
                  id="c-notes"
                  rows={3}
                  value={editing.notes}
                  onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button onClick={save} disabled={mutations.save.isPending}>
              Salvar cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
