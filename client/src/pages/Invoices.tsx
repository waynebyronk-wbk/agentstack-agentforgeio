import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

export default function Invoices() {
  const { data: invoices } = trpc.invoices.getAll.useQuery();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <FileText className="h-8 w-8" />
        Invoices
      </h1>
      <Card>
        <CardHeader><CardTitle>Invoice List</CardTitle></CardHeader>
        <CardContent>
          {invoices?.map((invoice) => (
            <div key={invoice.id} className="flex justify-between p-4 border-b">
              <div>
                <p className="font-medium">{invoice.invoiceNumber}</p>
                <p className="text-sm text-muted-foreground">Total: ${invoice.total}</p>
              </div>
              <Badge>{invoice.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
