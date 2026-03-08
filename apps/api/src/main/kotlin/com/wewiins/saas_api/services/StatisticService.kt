package com.wewiins.saas_api.services

import com.wewiins.saas_api.dto.VerifiedAccountDto
import com.wewiins.saas_api.interfaces.Dashboard
import com.wewiins.saas_api.interfaces.Statistic
import com.wewiins.saas_api.repositories.BookingRepository
import com.wewiins.saas_api.repositories.StripeRepository
import com.wewiins.saas_api.repositories.TimeSlotRepository
import com.wewiins.saas_api.utils.ComparisonCalculator
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.runBlocking
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import kotlin.math.roundToInt

@Service
class StatisticService(
    private val commonService: CommonService,
    private val stripeRepository: StripeRepository,
    private val timeSlotRepository: TimeSlotRepository,
    private val bookingRepository: BookingRepository
) {
    private val logger = LoggerFactory.getLogger(StatisticService::class.java)

    fun initializeStatistic(
        verifiedAccountDto: VerifiedAccountDto,
        startDate: Long,
        endDate: Long
    ): Statistic? {
        logger.info("Initialize statistic for period {} to {}", startDate, endDate)

        val filterRangeDays = ComparisonCalculator.calculateDaysBetween(startDate, endDate)
        val periodDuration = endDate - startDate
        val previousEndDate = startDate - 1
        val previousStartDate = previousEndDate - periodDuration

        return runBlocking {
            val currentTotalRevenueDeferred = async(Dispatchers.IO) {
                commonService.getTotalRevenueByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate,
                    endDate
                )
            }

            val currentTotalChargeDeferred = async(Dispatchers.IO) {
                getTotalChargeByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate,
                    endDate
                )
            }

            val currentTotalBookingDeferred = async(Dispatchers.IO) {
                commonService.getTotalBookingByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate,
                    endDate
                )
            }

            val totalSlotsDeferred = async(Dispatchers.IO) {
                timeSlotRepository.getTotalSlotsByPeriod(
                    connectedAccountId = verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate = startDate,
                    endDate = endDate
                )
            }

            val bookedSlotsDeferred = async(Dispatchers.IO) {
                bookingRepository.getBookedSlotsByPeriod(
                    connectedAccountId = verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate = startDate,
                    endDate = endDate
                )
            }

            val currentAverageScoreDeferred = async(Dispatchers.IO) {
                commonService.getAverageScoreByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate,
                    endDate
                )
            }

            // Retrieve statistics from the previous period
            val previousTotalRevenueDeferred = async(Dispatchers.IO) {
                commonService.getTotalRevenueByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    previousStartDate,
                    previousEndDate
                )
            }

            val previousTotalChargeDeferred = async(Dispatchers.IO) {
                getTotalChargeByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    previousStartDate,
                    previousEndDate
                )
            }

            val previousTotalBookingDeferred = async(Dispatchers.IO) {
                commonService.getTotalBookingByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    previousStartDate,
                    previousEndDate
                )
            }

            val previousTotalSlotsDeferred = async(Dispatchers.IO) {
                timeSlotRepository.getTotalSlotsByPeriod(
                    connectedAccountId = verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate = previousStartDate,
                    endDate = previousEndDate
                )
            }

            val previousBookedSlotsDeferred = async(Dispatchers.IO) {
                bookingRepository.getBookedSlotsByPeriod(
                    connectedAccountId = verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate = previousStartDate,
                    endDate = previousEndDate
                )
            }

            val previousAverageScoreDeferred = async(Dispatchers.IO) {
                commonService.getAverageScoreByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    previousStartDate,
                    previousEndDate
                )
            }

            // Current period
            val currentTotalRevenue = currentTotalRevenueDeferred.await()
            val currentTotalCharge = currentTotalChargeDeferred.await()
            val currentTotalBookingCount = currentTotalBookingDeferred.await()
            val currentTotalSlotCount = totalSlotsDeferred.await()
            val currentReservedSlotCount = bookedSlotsDeferred.await()
            val currentAverageScore = currentAverageScoreDeferred.await()

            // Previous period
            val previousTotalRevenue = previousTotalRevenueDeferred.await()
            val previousTotalCharge = previousTotalChargeDeferred.await()
            val previousTotalBookingCount = previousTotalBookingDeferred.await()
            val previousTotalSlotCount = previousTotalSlotsDeferred.await()
            val previousReservedSlotCount = previousBookedSlotsDeferred.await()
            val previousAverageScore = previousAverageScoreDeferred.await()

            val currentOccupancyRate = if (currentTotalSlotCount > 0) {
                ((currentReservedSlotCount.toDouble() / currentTotalSlotCount.toDouble()) * 100).roundToInt()
            } else 0

            val previousOccupancyRate = if (previousTotalSlotCount > 0) {
                ((previousReservedSlotCount.toDouble() / previousTotalSlotCount.toDouble()) * 100).roundToInt()
            } else 0

            // Compare statistics
            val revenueComparison = ComparisonCalculator.calculate(
                currentTotalRevenue.revenue,
                previousTotalRevenue.revenue
            )

            val chargeComparison = ComparisonCalculator.calculate(
                currentTotalCharge,
                previousTotalCharge
            )

            val bookingComparison = ComparisonCalculator.calculate(
                currentTotalBookingCount,
                previousTotalBookingCount
            )

            val occupancyRateComparison = ComparisonCalculator.calculate(
                currentOccupancyRate,
                previousOccupancyRate
            )

            val scoreComparison = ComparisonCalculator.calculate(
                currentAverageScore,
                previousAverageScore
            )

            Dashboard(
                totalRevenue = revenueComparison,
                totalCharges = chargeComparison,
                totalBooking = bookingComparison,
                occupancyRate = occupancyRateComparison
            )
        }
    }

    fun getTotalChargeByPeriod(
        connectedAccountId: String, startDate: Long, endDate: Long
    ): Double {
        logger.info("Get TotalChargeByPeriod")
        return runBlocking {
            stripeRepository.getTotalChargesByPeriod(connectedAccountId, startDate, endDate)
        }
    }
}