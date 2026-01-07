
"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { Calendar, Eye, FileText, Target, MoreVertical, Copy, Trash, Loader2, CheckCircle2, Clock, XCircle, SparklesIcon, Pencil } from "lucide-react"
import { PlanningOrder, PlanningObjective, ContentStrategy, PlanningStatus } from "@prisma/client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { STATUS_CONFIG } from "./PlanningList"

interface PlanningCardProps {
    order: PlanningOrder
    isPending: string | null
    onDuplicate: (id: string, name: string) => void
    onDelete: (id: string) => void
    onView: (order: PlanningOrder) => void
}

export function PlanningCard({ order, isPending, onDuplicate, onDelete, onView }: PlanningCardProps) {
    const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.ORDER_CREATED
    const StatusIcon = status.icon

    return (
        <Card className="group hover:shadow-md transition-shadow border-muted/60">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className={`${status.color} border-0`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                    </Badge>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2" disabled={isPending === order.id}>
                                {isPending === order.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <MoreVertical className="h-4 w-4" />
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onDuplicate(order.id, order.name)}>
                                <Copy className="mr-2 h-4 w-4" /> Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => onDelete(order.id)}
                            >
                                <Trash className="mr-2 h-4 w-4" /> Eliminar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <CardTitle className="text-lg leading-tight line-clamp-2">
                    {order.name}
                </CardTitle>
                <CardDescription className="flex items-center mt-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    {format(new Date(order.startDate), "d MMM", { locale: es })} - {format(new Date(order.endDate), "d MMM yyyy", { locale: es })}
                </CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
                <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary/70" />
                        <span className="capitalize">{order.objective.replace(/_/g, " ").toLowerCase()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary/70" />
                        <span className="capitalize">
                            {order.contentStrategy
                                ? order.contentStrategy.replace(/_/g, " ").toLowerCase()
                                : "Estrategia estándar"}
                        </span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="pt-3 border-t bg-muted/5 flex gap-2">
                <Button
                    variant="outline"
                    className="flex-1 hover:bg-white group-hover:border-primary/20 hover:border"
                    onClick={() => onView(order)}
                >
                    Ver
                    <Eye className="w-4 h-4 ml-2 text-muted-foreground" />
                </Button>
                <Button
                    variant="outline"
                    className="flex-1 hover:bg-white group-hover:border-primary/20 hover:border"
                    asChild
                >
                    <Link href={`/planificacion/${order.id}/editar`}>
                        Editar
                        <Pencil className="w-4 h-4 ml-2 text-muted-foreground" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
