import { revalidatePath } from "next/cache";
import { pool } from "@/lib/db";

type Employee = {
  id: number;
  name: string;
  role: string;
  salary: number;
  created_at: string;
};

async function getEmployees(): Promise<Employee[]> {
  try {
    const result = await pool.query<Employee>(
      `SELECT id, name, role, salary, created_at
       FROM employees
       ORDER BY created_at DESC`,
    );
    return result.rows;
  } catch (error) {
    console.error("Error loading employees", error);
    return [];
  }
}

export default async function Home() {
  try {
    await pool.query("SELECT 1"); // sample query to test connection
  } catch (error) {
    console.error("Database connection error", error);
    return <div>Failed to connect to database.</div>;
  }

  const employees = await getEmployees();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto flex max-w-4xl flex-col gap-10 px-6 py-12">
        <header className="flex flex-col gap-3 border-b border-zinc-200 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Postgres demo
          </p>
          <h1 className="text-3xl font-bold text-zinc-900">Employee manager</h1>
          <p className="max-w-2xl text-sm text-zinc-600">
            Create the table, seed some employees, and add more with the form
            below. All actions run on the server and use your{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">
              DATABASE_URL
            </code>{" "}
            connection string.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">1) Create table</h2>
                <p className="text-sm text-zinc-600">
                  Sets up an <code>employees</code> table if it does not exist.
                </p>
              </div>
              <FormButton action={createTableAction}>Create table</FormButton>
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">2) Seed sample data</h2>
                <p className="text-sm text-zinc-600">
                  Inserts a handful of starter employees.
                </p>
              </div>
              <FormButton action={seedEmployeesAction}>
                Insert samples
              </FormButton>
            </div>
          </Card>
        </section>

        <Card>
          <h2 className="text-lg font-semibold">3) Add an employee</h2>
          <p className="mb-4 text-sm text-zinc-600">
            Submit a new employee record.
          </p>
          <form
            action={addEmployeeAction}
            className="grid gap-4 md:grid-cols-3"
          >
            <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800">
              Name
              <input
                name="name"
                required
                placeholder="Ada Lovelace"
                className="rounded border border-zinc-200 px-3 py-2 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800">
              Role
              <input
                name="role"
                required
                placeholder="Engineer"
                className="rounded border border-zinc-200 px-3 py-2 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800">
              Salary (USD)
              <input
                name="salary"
                type="number"
                min="0"
                step="1000"
                required
                placeholder="120000"
                className="rounded border border-zinc-200 px-3 py-2 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
              />
            </label>
            <div className="md:col-span-3">
              <button
                type="submit"
                className="inline-flex w-full justify-center rounded-md bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                Add employee
              </button>
            </div>
          </form>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold">Employees</h2>
              <p className="text-sm text-zinc-600">
                Showing {employees.length} record
                {employees.length === 1 ? "" : "s"}.
              </p>
            </div>
            <form action={refreshAction}>
              <button
                type="submit"
                className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100"
              >
                Refresh
              </button>
            </form>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <HeaderCell>ID</HeaderCell>
                  <HeaderCell>Name</HeaderCell>
                  <HeaderCell>Role</HeaderCell>
                  <HeaderCell>Salary</HeaderCell>
                  <HeaderCell>Created</HeaderCell>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 bg-white">
                {employees.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-sm text-zinc-500"
                    >
                      No data yet. Create the table, seed, or add an employee.
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-zinc-50">
                      <DataCell>{emp.id}</DataCell>
                      <DataCell className="font-medium">{emp.name}</DataCell>
                      <DataCell>{emp.role}</DataCell>
                      <DataCell>
                        {`$${Number(emp.salary).toLocaleString()}`}
                      </DataCell>
                      <DataCell>
                        {new Date(emp.created_at).toLocaleString()}
                      </DataCell>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      {children}
    </div>
  );
}

function HeaderCell({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
      {children}
    </th>
  );
}

function DataCell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-4 py-3 text-sm text-zinc-800 ${className}`}>
      {children}
    </td>
  );
}

function FormButton({
  action,
  children,
}: {
  action: (formData: FormData) => Promise<void> | void;
  children: React.ReactNode;
}) {
  return (
    <form action={action}>
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
      >
        {children}
      </button>
    </form>
  );
}

export async function createTableAction() {
  "use server";

  await pool.query(`
    CREATE TABLE IF NOT EXISTS employees (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      salary INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  revalidatePath("/");
}

export async function seedEmployeesAction() {
  "use server";

  await pool.query(`
    INSERT INTO employees (name, role, salary)
    VALUES
      ('Ada Lovelace', 'Engineer', 160000),
      ('Grace Hopper', 'Scientist', 180000),
      ('Margaret Hamilton', 'Engineering Manager', 210000)
    ON CONFLICT DO NOTHING
  `);

  revalidatePath("/");
}

export async function addEmployeeAction(formData: FormData) {
  "use server";

  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const salaryRaw = formData.get("salary");
  const salary = Number(salaryRaw);

  if (!name || !role || Number.isNaN(salary) || salary < 0) {
    throw new Error("Invalid form input");
  }

  await pool.query(
    `INSERT INTO employees (name, role, salary) VALUES ($1, $2, $3)`,
    [name, role, salary],
  );

  revalidatePath("/");
}

export async function refreshAction() {
  "use server";
  revalidatePath("/");
}
