"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useSoundEffects } from "@/lib/hooks/use-sound-effects"
import { Volume2, VolumeX, TestTube, Mic, MicOff } from "lucide-react"
import { useState } from "react"

export function SoundControls() {
  const { enabled, setEnabled, volume, setVolume, numberCalled, bingoClaimed, gameWon } = useSoundEffects()
  const [voiceEnabled, setVoiceEnabled] = useState(false)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          Audio & Voice
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm">Sound Effects</span>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">Voice Announcements</span>
            {voiceEnabled ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
          </div>
          <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
        </div>

        {enabled && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Volume</span>
                <span className="text-xs text-muted-foreground">{Math.round(volume * 100)}%</span>
              </div>
              <Slider
                value={[volume]}
                onValueChange={([value]) => setVolume(value)}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm">
                <TestTube className="h-3 w-3" />
                <span>Test Sounds</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" onClick={numberCalled} className="text-xs bg-transparent">
                  Number
                </Button>
                <Button variant="outline" size="sm" onClick={bingoClaimed} className="text-xs bg-transparent">
                  Bingo
                </Button>
                <Button variant="outline" size="sm" onClick={gameWon} className="text-xs bg-transparent">
                  Win
                </Button>
              </div>
            </div>
          </>
        )}

        {voiceEnabled && (
          <div className="space-y-2 pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              Voice announcements will read out called numbers and game events
            </div>
            <Button variant="outline" size="sm" className="w-full text-xs bg-transparent">
              Test Voice: "B-7"
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
