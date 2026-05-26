# Batch rename pass for v0.3.0 — applies the agreed terminology dictionary
# to all .vue / .ts files under apps/wechat-uniapp/src and apps/desktop/src.
# Excludes original article quotations: article.ts files are intentionally NOT touched.

$ErrorActionPreference = 'Stop'

$mappings = @(
  # Order matters — most specific first
  # — UI block titles —
  @{ from = '原文 5 步:卡点 / 命名敌人 / 压缩反愿景 / 压缩愿景 / 三透镜'; to = '原文 5 步:卡点 / 看清是什么挡住了你 / 不想回去的样子 / 想去到的样子 / 三维度' },
  @{ from = '保存时 N3 / N4 会自动写回到「道路」的反愿景与愿景顶部;N5.L3 的明日时间块会自动升格为「今日杠杆」'; to = '保存时 N3 / N4 会自动写回到「道路」的反愿景与愿景顶部;N5.L3 的几个时间段会自动加进明天的「每日动作」' },
  @{ from = 'N5 · 创建三透镜'; to = 'N5 · 三维度' },
  @{ from = 'N4 · 一句话愿景 MVP'; to = 'N4 · 一句话「想去到的样子(最小版)」' },
  @{ from = 'N4 愿景 MVP'; to = 'N4 想去到的样子(最小版)' },
  @{ from = 'N5 三透镜'; to = 'N5 三维度' },
  @{ from = 'N2 · 命名敌人'; to = 'N2 · 看清是什么挡住了你' },
  @{ from = 'N2 命名敌人'; to = 'N2 看清是什么挡住了你' },
  @{ from = '一月项目 · Boss 战'; to = 'Boss 战(这个月目标)' },
  @{ from = '一年目标 · 主线任务'; to = '一年方向' },
  @{ from = '当天主线'; to = '当天的方向' },
  @{ from = '今日主线'; to = '一年方向' },
  @{ from = '方向与主线'; to = '方向与一年' },
  @{ from = 'L3 · 每日透镜 · 明天 2-3 个时间块'; to = 'L3 · 今天的行动 · 明天 2-3 个时间段' },
  @{ from = '一年透镜:'; to = '一年方向:' },
  @{ from = '一月透镜:'; to = '这个月重点:' },
  @{ from = '每日透镜:'; to = '每日反思:' },
  @{ from = '一年透镜'; to = '一年方向' },
  @{ from = '一月透镜'; to = '这个月重点' },
  @{ from = '每日透镜'; to = '每日反思' },
  @{ from = '把今天压成 5 步:卡点 / 命名敌人 / 反愿景 / 愿景 / 三透镜'; to = '晚上 5 步:卡点 / 看清是什么挡住了你 / 不想回去的样子 / 想去到的样子 / 三维度' },
  @{ from = '夜间综合锚点'; to = '晚上回顾入口' },
  @{ from = '响起时进入 5 步综合'; to = '响起时进入 5 步回顾' },
  @{ from = '完成一次「夜间综合」后,L3 的明日时间块会自动升格'; to = '完成一次「晚上回顾」后,L3 的几个时间段会自动加进明天的动作' },
  @{ from = '5 步夜晚综合'; to = '5 步晚上回顾' },
  @{ from = '夜间综合'; to = '晚上回顾' },
  @{ from = '中断自动驾驶'; to = '白天打断' },
  @{ from = '心理开掘'; to = '认真想清楚' },

  # — leverage / proof rules —
  @{ from = '还没有生效的每日杠杆'; to = '还没有每日动作' },
  @{ from = '还没有可验证的身份动作'; to = '还没写下「每日动作」' },
  @{ from = '当前生效 ${activeRules.value.length} 条杠杆'; to = '当前生效 ${activeRules.value.length} 条每日动作' },
  @{ from = '今天的杠杆全部到手'; to = '今天的动作都做完了,稳住' },
  @{ from = '做一个杠杆就开始拉回来'; to = '做一件小事就开始拉回来' },
  @{ from = '今天有些松动,做一个杠杆就开始拉回来'; to = '今天有些松动,做一件小事就开始拉回来' },
  @{ from = '做一个最小杠杆就能拉回来'; to = '做一件最小的事就能拉回来' },
  @{ from = 'L3 添加杠杆'; to = 'L3 添加每日动作' },
  @{ from = '条杠杆已完成'; to = '条每日动作已完成' },
  @{ from = '管理杠杆'; to = '管理动作' },
  @{ from = '新增杠杆'; to = '新增动作' },
  @{ from = '关联一年目标(主线)'; to = '关联一年方向' },
  @{ from = '关联一月项目(Boss 战)'; to = '关联 Boss 战(这个月目标)' },
  @{ from = '每日杠杆摘要'; to = '每日动作摘要' },
  @{ from = '每日杠杆'; to = '每日动作' },
  @{ from = '今日杠杆'; to = '每日动作' },
  @{ from = '日常杠杆'; to = '每日动作' },
  @{ from = '撤销身份证明'; to = '撤销动作完成' },
  @{ from = '完成身份证明'; to = '完成今日动作' },

  # — vision MVP / Boss / mission —
  @{ from = '愿景 MVP (Q12-Q15)'; to = '想去到的样子(最小版)(Q12-Q15)' },
  @{ from = '反愿景叙事 (Q5-Q11)'; to = '不想回去的样子 (Q5-Q11)' },
  @{ from = '看见钝感不满 (Q1-Q4)'; to = '看见心里的不舒服 (Q1-Q4)' },
  @{ from = '本月 Boss 战'; to = 'Boss 战(这个月目标)' },
  @{ from = '原文里这叫主线任务和 Boss 战'; to = '一年定方向,一月定具体里程碑' },
  @{ from = '主线任务和 Boss 战'; to = '一年方向和 Boss 战(这个月目标)' },

  # — time blocks / promote —
  @{ from = '明天 2-3 个时间块'; to = '明天 2-3 个时间段' },
  @{ from = '今天的 2-3 个时间块'; to = '今天的 2-3 件小事' },
  @{ from = '先把今天的 2-3 个时间块定下来'; to = '先把今天的 2-3 件小事定下来' },
  @{ from = '保存一次夜间综合,明天就有时间块'; to = '保存一次晚上回顾,明天就有了' },
  @{ from = '夜间综合 N5.L3 的「明日 2-3 个时间块」会自动升格成这里的每日杠杆'; to = '保存「晚上回顾」时,L3 写下的几个时间段会自动加进明天的动作' },
  @{ from = '把 N5 的明日时间块自动升格为「今日杠杆」'; to = '把 N5 写下的几个时间段加进明天的「每日动作」' },
  @{ from = '明日时间块'; to = '明天的几个时间段' },
  @{ from = '明天的几个时间段'; to = '明天的几个时间段' },
  @{ from = '添加时间块'; to = '添加时间段' },
  @{ from = '+ 添加时间块'; to = '+ 添加时间段' },
  @{ from = '删除这个时间块'; to = '删除这个时间段' },
  @{ from = '把当晚综合的明日时间块自动升格为「今日杠杆」,系统就开始跑'; to = '保存「晚上回顾」时,几个时间段会自动加进明天的动作,系统就开始跑' },

  # — chip labels —
  @{ from = '<span v-if="rule.linkedYearGoal" class="tag-chip">主线</span>'; to = '<span v-if="rule.linkedYearGoal" class="tag-chip">这一年的方向</span>' },
  @{ from = '<span v-if="rule.linkedMonthProject" class="tag-chip">Boss 战</span>'; to = '<span v-if="rule.linkedMonthProject" class="tag-chip">Boss 战(这个月目标)</span>' },
  @{ from = '<text v-if="rule.linkedYearGoal" class="tag-chip">主线</text>'; to = '<text v-if="rule.linkedYearGoal" class="tag-chip">这一年的方向</text>' },
  @{ from = '<text v-if="rule.linkedMonthProject" class="tag-chip">Boss 战</text>'; to = '<text v-if="rule.linkedMonthProject" class="tag-chip">Boss 战(这个月目标)</text>' },

  # — privacy lists —
  @{ from = '你写下的愿景、反愿景、身份、目标、每日杠杆'; to = '你写下的愿景、反愿景、身份、目标、每日动作' },
  @{ from = '你回答的开掘题、白天打断作答、夜间综合内容'; to = '你回答的开掘题、白天打断作答、晚上回顾内容' }
)

$targets = @(
  'apps\wechat-uniapp\src\pages',
  'apps\wechat-uniapp\src\components',
  'apps\wechat-uniapp\src\stores',
  'apps\desktop\src\pages',
  'apps\desktop\src\components'
)

$totalChanges = 0
foreach ($t in $targets) {
  if (-not (Test-Path $t)) { continue }
  $files = Get-ChildItem -Recurse -Path $t -Include *.vue, *.ts -ErrorAction SilentlyContinue
  foreach ($f in $files) {
    # Skip article.ts to preserve original Dan Koe quotations
    if ($f.Name -eq 'article.ts') { continue }
    $content = [System.IO.File]::ReadAllText($f.FullName, [System.Text.UTF8Encoding]::new($false))
    $orig = $content
    foreach ($m in $mappings) {
      if ($content.Contains($m.from)) {
        $content = $content.Replace($m.from, $m.to)
      }
    }
    if ($content -ne $orig) {
      [System.IO.File]::WriteAllText($f.FullName, $content, [System.Text.UTF8Encoding]::new($false))
      $totalChanges += 1
      Write-Output ("changed: {0}" -f $f.FullName)
    }
  }
}

Write-Output ("done. files changed: {0}" -f $totalChanges)
