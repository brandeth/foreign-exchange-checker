import { computed, nextTick, onBeforeUnmount, onMounted, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'

type UseMarqueeOptions = {
  enabled?: MaybeRefOrGetter<boolean>
  duration?: MaybeRefOrGetter<number>
}

export function useMarquee(options: UseMarqueeOptions = {}) {
  const container = ref<HTMLElement | null>(null)
  const track = ref<HTMLElement | null>(null)
  const offset = ref(0)

  const enabled = computed(() => toValue(options.enabled) ?? true)
  const duration = computed(() => toValue(options.duration) ?? 34000)

  let animationFrame = 0
  let lastFrameTime = 0
  let baseSpeed = 0
  let currentSpeedMultiplier = 1
  let requestedSpeedMultiplier = 1
  let reduceMotion = false
  let resizeObserver: ResizeObserver | undefined

  const trackStyle = computed(() => enabled.value
    ? { transform: `translateX(${-offset.value}px)` }
    : undefined,
  )

  function getMarqueeWidth() {
    return (track.value?.scrollWidth ?? 0) / 2
  }

  function measure() {
    const marqueeWidth = getMarqueeWidth()

    baseSpeed = duration.value > 0 ? marqueeWidth / duration.value : 0

    if (marqueeWidth > 0 && offset.value >= marqueeWidth)
      offset.value %= marqueeWidth
  }

  function update(time: number) {
    if (!lastFrameTime)
      lastFrameTime = time

    const elapsed = time - lastFrameTime
    lastFrameTime = time
    const targetSpeedMultiplier = container.value?.matches(':hover') ? 0 : requestedSpeedMultiplier

    currentSpeedMultiplier += (targetSpeedMultiplier - currentSpeedMultiplier) * Math.min(elapsed / 500, 1)

    if (Math.abs(targetSpeedMultiplier - currentSpeedMultiplier) < 0.001)
      currentSpeedMultiplier = targetSpeedMultiplier

    const marqueeWidth = getMarqueeWidth()

    if (marqueeWidth > 0 && baseSpeed > 0)
      offset.value = (offset.value + baseSpeed * currentSpeedMultiplier * elapsed) % marqueeWidth

    animationFrame = requestAnimationFrame(update)
  }

  function start() {
    cancelAnimationFrame(animationFrame)
    lastFrameTime = 0
    measure()

    if (enabled.value && !reduceMotion)
      animationFrame = requestAnimationFrame(update)
  }

  function setTargetSpeed(speed: number) {
    requestedSpeedMultiplier = speed
  }

  onMounted(() => {
    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    resizeObserver = new ResizeObserver(measure)

    if (track.value)
      resizeObserver.observe(track.value)

    nextTick(start)
  })

  watch([enabled, duration], start)

  onBeforeUnmount(() => {
    cancelAnimationFrame(animationFrame)
    resizeObserver?.disconnect()
  })

  return {
    container,
    track,
    trackStyle,
    setTargetSpeed,
  }
}
