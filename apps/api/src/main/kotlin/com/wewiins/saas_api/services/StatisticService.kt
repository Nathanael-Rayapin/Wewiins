package com.wewiins.saas_api.services

import com.wewiins.saas_api.dto.VerifiedAccountDto
import com.wewiins.saas_api.interfaces.Statistic
import com.wewiins.saas_api.repositories.ActivityRepository
import com.wewiins.saas_api.repositories.BookingRepository
import com.wewiins.saas_api.repositories.FavoriteRepository
import com.wewiins.saas_api.repositories.StatisticRepository
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
    private val stripeService: StripeService,
    private val stripeRepository: StripeRepository,
    private val activityRepository: ActivityRepository,
    private val favoriteRepository: FavoriteRepository,
    private val bookingRepository: BookingRepository,
    private val timeSlotRepository: TimeSlotRepository,
    private val statisticRepository: StatisticRepository
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
            // Revenues
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

            // Charges
            val currentTotalChargeDeferred = async(Dispatchers.IO) {
                stripeService.getTotalChargeByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate,
                    endDate
                )
            }

            val previousTotalChargeDeferred = async(Dispatchers.IO) {
                stripeService.getTotalChargeByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    previousStartDate,
                    previousEndDate
                )
            }

            val currentTotalCharge = currentTotalChargeDeferred.await()
            val previousTotalCharge = previousTotalChargeDeferred.await()

            val chargeComparison = ComparisonCalculator.calculate(
                currentTotalCharge,
                previousTotalCharge
            )

            // Bookings
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

            // Slots
            val currentTotalSlotsDeferred = async(Dispatchers.IO) {
                timeSlotRepository.getTotalSlotsByPeriod(
                    connectedAccountId = verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate = startDate,
                    endDate = endDate
                )
            }

            val previousTotalSlotsDeferred = async(Dispatchers.IO) {
                timeSlotRepository.getTotalSlotsByPeriod(
                    connectedAccountId = verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate = previousStartDate,
                    endDate = previousEndDate
                )
            }

            val currentTotalSlot = currentTotalSlotsDeferred.await()
            val previousTotalSlot = previousTotalSlotsDeferred.await()

            val slotComparison = ComparisonCalculator.calculate(
                currentTotalSlot,
                previousTotalSlot
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

            val averageScoreComparison = ComparisonCalculator.calculate(
                currentAverageScore,
                previousAverageScore
            )

            // Occupancy
            val currentOccupancyRate = if (currentTotalSlot > 0) {
                ((currentTotalBooking.toDouble() / currentTotalSlot.toDouble()) * 100).roundToInt()
            } else 0

            val previousOccupancyRate = if (previousTotalSlot > 0) {
                ((previousTotalBooking.toDouble() / previousTotalSlot.toDouble()) * 100).roundToInt()
            } else 0

            val occupancyComparison = ComparisonCalculator.calculate(
                currentOccupancyRate,
                previousOccupancyRate
            )

            // Cancellation
            val currentCancellationRateDeferred = async(Dispatchers.IO) {
                bookingRepository.getCancellationRateByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate,
                    endDate
                )
            }

            val previousCancellationRateDeferred = async(Dispatchers.IO) {
                bookingRepository.getCancellationRateByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    previousStartDate,
                    previousEndDate
                )
            }

            val currentCancellationRate = currentCancellationRateDeferred.await()
            val previousCancellationRate = previousCancellationRateDeferred.await()

            val cancellationComparison = ComparisonCalculator.calculate(
                currentCancellationRate,
                previousCancellationRate
            )

            // Average Participant
            val currentAverageParticipantsDeferred = async(Dispatchers.IO) {
                bookingRepository.getAverageParticipantsByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate,
                    endDate
                )
            }

            val previousAverageParticipantsDeferred = async(Dispatchers.IO) {
                bookingRepository.getAverageParticipantsByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    previousStartDate,
                    previousEndDate
                )
            }

            val currentAverageParticipants = currentAverageParticipantsDeferred.await()
            val previousAverageParticipants = previousAverageParticipantsDeferred.await()

            val averageParticipantsComparison = ComparisonCalculator.calculate(
                currentAverageParticipants,
                previousAverageParticipants
            )

            // Favorite
            val currentFavoritesCountDeferred = async(Dispatchers.IO) {
                favoriteRepository.getTotalFavoritesByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate,
                    endDate
                )
            }

            val previousFavoritesCountDeferred = async(Dispatchers.IO) {
                favoriteRepository.getTotalFavoritesByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    previousStartDate,
                    previousEndDate
                )
            }

            val currentFavoritesCount = currentFavoritesCountDeferred.await()
            val previousFavoritesCount = previousFavoritesCountDeferred.await()

            val favoritesComparison = ComparisonCalculator.calculate(
                currentFavoritesCount,
                previousFavoritesCount
            )

            // Visit Distribution
            val visitsByPeriodDeferred = async(Dispatchers.IO) {
                statisticRepository.getVisitDataPointsByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate,
                    endDate
                )
            }

            val visitsByPeriod = visitsByPeriodDeferred.await()


            // Score Distribution
            val scoreDistributionDeferred = async(Dispatchers.IO) {
                statisticRepository.getScoreDistributionByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate,
                    endDate
                )
            }

            val scoreDistribution = scoreDistributionDeferred.await()

            Statistic(
                totalRevenue = revenueComparison,
                totalCharges = chargeComparison,
                totalBooking = bookingComparison,
                averageOccupancy = occupancyComparison,
                averageCancellation = cancellationComparison,
                averageParticipants = averageParticipantsComparison,
                totalFavorites = favoritesComparison,
                averageScore = averageScoreComparison,
                visitsByPeriod = visitsByPeriod,
                scoreDistribution = scoreDistribution,
                filterRangeDays = filterRangeDays,
            )
        }
    }
}