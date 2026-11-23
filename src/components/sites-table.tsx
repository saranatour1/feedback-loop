import { Link } from '@tanstack/react-router'
import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'
import type { FunctionReturnType } from 'convex/server'
import type { api } from '../../convex/_generated/api'
import { Badge } from '~/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'

type Site = FunctionReturnType<typeof api.api.sites.list>[number]

// Module scope keeps features and columns stable across renders, which
// TanStack Table v9 relies on to avoid rebuilding row models.
const features = tableFeatures({})
const column = createColumnHelper<typeof features, Site>()
const columns = column.columns([
  column.accessor('name', {
    header: 'Site',
    cell: ({ row }) => (
      <Link
        to="/sites/$siteId"
        params={{ siteId: row.original._id }}
        className="font-medium underline-offset-4 hover:underline"
      >
        {row.original.name}
      </Link>
    ),
  }),
  column.accessor('code', {
    header: 'Code',
    cell: ({ getValue }) => <Badge variant="outline">{getValue()}</Badge>,
  }),
  column.accessor('url', {
    header: 'URL',
    cell: ({ getValue }) => (
      <span className="block max-w-[16rem] truncate text-muted-foreground">
        {getValue()}
      </span>
    ),
  }),
])

export function SitesTable({ sites }: { sites: Array<Site> }) {
  const table = useTable({ features, columns, data: sites })
  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id}>
            {group.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder ? null : (
                  <table.FlexRender header={header} />
                )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getAllCells().map((cell) => (
              <TableCell key={cell.id}>
                <table.FlexRender cell={cell} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
