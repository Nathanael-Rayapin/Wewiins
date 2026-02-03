package com.wewiins.saas_api.utils

import com.wewiins.saas_api.interfaces.ComparisonStat
import kotlin.math.abs
import kotlin.math.roundToInt

object ComparisonCalculator {
    private const val STABLE_THRESHOLD = 0.01 // 0.01% threshold for stability

    /**
     * Calculates the comparison between a current value and a previous value
     * @param current Current value
     * @param previous Previous value
     * @return ComparisonStat with percentage and trend
     */
    fun <T : Number> calculate(current: T, previous: T): ComparisonStat<T> {
        val currentDouble = current.toDouble()
        val previousDouble = previous.toDouble()

        val percentageChange = when {
            previousDouble == 0.0 && currentDouble == 0.0 -> 0.0
            previousDouble == 0.0 -> 100.0 // If previous = 0 and current > 0, then +100%
            else -> ((currentDouble - previousDouble) / previousDouble) * 100
        }

        val trend = when {
            abs(percentageChange) < STABLE_THRESHOLD -> ComparisonStat.Trend.STABLE
            percentageChange > 0 -> ComparisonStat.Trend.UP
            else -> ComparisonStat.Trend.DOWN
        }

        val roundedPercentage = (percentageChange * 10).roundToInt() / 10.0

        return ComparisonStat(
            currentValue = current,
            previousValue = previous,
            percentageChange = roundedPercentage,
            trend = trend
        )
    }

    /**
     * Calculates the number of days between two Unix timestamps (in seconds)
     */
    fun calculateDaysBetween(startDate: Long, endDate: Long): Int {
        val seconds = endDate - startDate
        val days = seconds / (24 * 60 * 60)
        return days.toInt() + 1 // +1 to include the end date
    }
}