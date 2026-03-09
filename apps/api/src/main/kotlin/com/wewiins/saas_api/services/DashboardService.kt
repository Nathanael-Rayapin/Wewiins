package com.wewiins.saas_api.services

import com.wewiins.saas_api.dto.VerifiedAccountDto
import com.wewiins.saas_api.interfaces.Dashboard
import com.wewiins.saas_api.repositories.ActivityRepository
import com.wewiins.saas_api.repositories.BookingRepository
import com.wewiins.saas_api.repositories.StatisticRepository
import com.wewiins.saas_api.repositories.StripeRepository
import com.wewiins.saas_api.utils.ComparisonCalculator
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.runBlocking
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class DashboardService(
    private val bookingRepository: BookingRepository,
    private val stripeRepository: StripeRepository,
    private val statisticRepository: StatisticRepository,
    private val activityRepository: ActivityRepository,
) {
    private val logger = LoggerFactory.getLogger(DashboardService::class.java)

    fun initializeDashboard(
        verifiedAccountDto: VerifiedAccountDto,
        startDate: Long,
        endDate: Long
    ): Dashboard? {
        logger.info("Initialize dashboard for period {} to {}", startDate, endDate)

        // Calculate the previous period
        val filterRangeDays = ComparisonCalculator.calculateDaysBetween(startDate, endDate)
        val periodDuration = endDate - startDate
        val previousEndDate = startDate - 1 // The day before the start of the current period
        val previousStartDate = previousEndDate - periodDuration

        return runBlocking {
            // Revenue
            val currentTotalRevenueDeferred = async(Dispatchers.IO) {
                stripeRepository.getTotalRevenueByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate,
                    endDate
                )
            }

            val previousTotalRevenueDeferred = async(Dispatchers.IO) {
                stripeRepository.getTotalRevenueByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    previousStartDate,
                    previousEndDate
                )
            }

            val currentTotalRevenue = currentTotalRevenueDeferred.await()
            val previousTotalRevenue = previousTotalRevenueDeferred.await()

            val revenueComparison = ComparisonCalculator.calculate(
                currentTotalRevenue.revenue,
                previousTotalRevenue.revenue
            )

            // Booking
            val currentTotalBookingDeferred = async(Dispatchers.IO) {
                bookingRepository.getConfirmedBookingCountByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate,
                    endDate
                )
            }

            val previousTotalBookingDeferred = async(Dispatchers.IO) {
                bookingRepository.getConfirmedBookingCountByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    previousStartDate,
                    previousEndDate
                )
            }

            val currentTotalBooking = currentTotalBookingDeferred.await()
            val previousTotalBooking = previousTotalBookingDeferred.await()

            val bookingComparison = ComparisonCalculator.calculate(
                currentTotalBooking,
                previousTotalBooking
            )

            // Visit
            val currentTotalVisitDeferred = async(Dispatchers.IO) {
                statisticRepository.getTotalVisitByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate,
                    endDate
                )
            }

            val previousTotalVisitDeferred = async(Dispatchers.IO) {
                statisticRepository.getTotalVisitByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    previousStartDate,
                    previousEndDate
                )
            }

            val currentTotalVisit = currentTotalVisitDeferred.await()
            val previousTotalVisit = previousTotalVisitDeferred.await()

            val visitComparison = ComparisonCalculator.calculate(
                currentTotalVisit,
                previousTotalVisit
            )

            // Average Score
            val currentAverageScoreDeferred = async(Dispatchers.IO) {
                activityRepository.getAverageScoreByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate,
                    endDate
                )
            }

            val previousAverageScoreDeferred = async(Dispatchers.IO) {
                activityRepository.getAverageScoreByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    previousStartDate,
                    previousEndDate
                )
            }

            val currentAverageScore = currentAverageScoreDeferred.await()
            val previousAverageScore = previousAverageScoreDeferred.await()

            val scoreComparison = ComparisonCalculator.calculate(
                currentAverageScore,
                previousAverageScore
            )

            // Retrieve the first 2 reservations
            val bookingsDeferred = async(Dispatchers.IO) {
                bookingRepository.getBookingsByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate,
                )
            }

            val bookings = bookingsDeferred.await()

            Dashboard(
                totalRevenue = revenueComparison,
                totalBooking = bookingComparison,
                totalVisit = visitComparison,
                averageScore = scoreComparison,
                filterRangeDays = filterRangeDays,
                bookings = bookings,
                isRevenueCompletelyLoad = currentTotalRevenue.isComplete
            )
        }
    }
}