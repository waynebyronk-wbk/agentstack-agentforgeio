import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function Customers() {
  const { data: customers } = trpc.customers.getAll.useQuery();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Users className="h-8 w-8" />
        Customers
      </h1>
      <Card>
        <CardHeader><CardTitle>Customer List</CardTitle></CardHeader>
        <CardContent>
          {customers?.map((customer) => (
            <div key={customer.id} className="p-4 border-b">
              <p className="font-medium">{customer.name}</p>
              <p className="text-sm text-muted-foreground">{customer.email}</p>
              {customer.company && <p className="text-sm">{customer.company}</p>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
