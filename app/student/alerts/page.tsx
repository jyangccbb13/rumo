"use client"

import { Bell, AlertCircle, Info, Clock } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/lib/inMemoryStore"

export default function AlertsPage() {
  const alerts = useAppStore((state) => state.alerts)
  const addAlert = useAppStore((state) => state.addAlert)
  const clearAlerts = useAppStore((state) => state.clearAlerts)

  function handleSimulateAlert() {
    addAlert({
      type: "deadline",
      message: "Personal Statement due in 24 hours — don't forget to submit!",
    })
    toast.info("Alert added", { description: "Check your alerts below." })
  }

  const alertIcons = {
    deadline: <Clock className="size-5 text-yellow-600" />,
    status: <AlertCircle className="size-5 text-blue-600" />,
    info: <Info className="size-5 text-muted-foreground" />,
  }

  const alertColors = {
    deadline: "border-yellow-500/40 bg-yellow-500/5",
    status: "border-blue-500/40 bg-blue-500/5",
    info: "border-border bg-card",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Alerts</h1>
          <p className="mt-2 text-muted-foreground">
            Stay on top of deadlines and important updates.
          </p>
        </div>
        {alerts.length > 0 && (
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={clearAlerts}
          >
            Clear All
          </Button>
        )}
      </div>

      {alerts.length === 0 ? (
        <Card className="rounded-2xl border-dashed border-primary/30 bg-primary/5 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Bell className="size-8 text-primary" />
            </div>
            <CardTitle>No alerts</CardTitle>
            <CardDescription className="text-base">
              You're all caught up! We'll notify you of upcoming deadlines and status
              changes.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              size="lg"
              className="rounded-xl px-8 shadow-md"
              onClick={handleSimulateAlert}
            >
              Simulate 24h deadline alert
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card
              key={alert.id}
              className={`rounded-2xl shadow-md ${alertColors[alert.type]}`}
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="mt-1">{alertIcons[alert.type]}</div>
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <CardTitle className="text-lg">{alert.message}</CardTitle>
                      <Badge variant="outline" className="rounded-full text-xs">
                        {alert.type}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {new Date(alert.createdAt).toLocaleString()}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
