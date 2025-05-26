            <div className="space-y-2">
              <Label htmlFor="skillLevel">Skill Level</Label>
              <Select
                value={skillLevel}
                onValueChange={setSkillLevel}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                  <SelectValue placeholder="Select skill level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Little League">Little League</SelectItem>
                  <SelectItem value="High School">High School</SelectItem>
                  <SelectItem value="College">College</SelectItem>
                  <SelectItem value="Professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isProgramContent"
                  checked={isProgramContent}
                  onCheckedChange={(checked) => setIsProgramContent(checked as boolean)}
                  className="border-slate-700 bg-slate-800 text-emerald-500"
                />
                <Label htmlFor="isProgramContent" className="text-slate-300 cursor-pointer">
                  Mark as Program Content
                </Label>
              </div>
              <p className="text-sm text-slate-400 ml-6">
                Program content will be easily accessible to all coaches in your program
              </p>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
            </div> 