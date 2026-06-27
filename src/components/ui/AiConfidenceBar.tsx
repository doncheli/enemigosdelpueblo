interface AiConfidenceBarProps {
  score: number
}

export default function AiConfidenceBar({ score }: AiConfidenceBarProps) {
  const barColor =
    score >= 0.75 ? 'bg-[#4ADE80]' : score >= 0.5 ? 'bg-[#FCD34D]' : 'bg-primary'
  const textColor =
    score >= 0.75 ? 'text-[#4ADE80]' : score >= 0.5 ? 'text-[#FCD34D]' : 'text-primary'

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold text-textSecondary uppercase tracking-widest">
        Confianza IA:
      </span>
      <div className="h-1.5 w-32 bg-elevated rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all`}
          style={{ width: `${score * 100}%` }}
        />
      </div>
      <span className={`font-mono text-[10px] ${textColor}`}>{score.toFixed(2)}</span>
    </div>
  )
}
