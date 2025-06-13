import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, X } from "lucide-react";

const PROPERTY_LIST = ["Apartment A", "Condo B", "Villa C"];

export default function FinancialsUI() {
  const [tab, setTab] = useState<"income" | "expense">("income");
  const [selectedProperty, setSelectedProperty] = useState(PROPERTY_LIST[0]);
  const [modalOpen, setModalOpen] = useState(false);

  const summary = { income: 45200, expense: 15800, net: 29400 };
  const records = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    category: tab === "income" ? "Rent" : "Maintenance",
    amount: (tab === "income" ? [7000, 8000] : [2000, 2500])[i % 2],
    date: `2025-0${i + 1}-01`,
  }));

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as "income" | "expense")}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expense">Expenses</TabsTrigger>
        </TabsList>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total {tab === "income" ? "Income" : "Expenses"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">
                ₱{(tab === "income" ? summary.income : summary.expense).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Net Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">₱{summary.net.toLocaleString()}</p>
            </CardContent>
          </Card>
          {/* Empty cell to keep 3‑col layout */}
          <div />
        </div>

        {/* Toolbar Card */}
        <Card>
          <CardHeader>
            <CardTitle>Add {tab === "income" ? "Income" : "Expense"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm mb-1">Property</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                >
                  {PROPERTY_LIST.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                className="whitespace-nowrap self-start md:self-end"
                onClick={() => setModalOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                New {tab === "income" ? "Income" : "Expense"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tab Content */}
        <TabsContent value={tab} className="space-y-4">
          {/* Chart placeholder */}
          <div className="h-48 flex items-center justify-center border border-dashed rounded text-gray-400">
            {tab === "income"
              ? `Income chart for ${selectedProperty}`
              : `Expense chart for ${selectedProperty}`}
          </div>

          {/* Records Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.id}</TableCell>
                    <TableCell>{r.category}</TableCell>
                    <TableCell>{r.date}</TableCell>
                    <TableCell className="text-right">
                      ₱{r.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button size="icon" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                New {tab === "income" ? "Income" : "Expense"}
              </h2>
              <button onClick={() => setModalOpen(false)}>
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Category</label>
                <input
                  type="text"
                  placeholder={tab === "income" ? "e.g. Rent" : "e.g. Repair"}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Amount</label>
                <input
                  type="number"
                  placeholder="₱0"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Date</label>
                <input
                  type="date"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <Button type="submit" className="w-full mt-2">
                Save
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
