package com.wewiins.saas_api.controllers

import com.wewiins.saas_api.dto.VerifiedAccountDto
import com.wewiins.saas_api.interfaces.Statistic
import com.wewiins.saas_api.services.StatisticService
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/statistic")
class StatisticController(
    private val statisticService: StatisticService,
) {
    @GetMapping("/initialize")
    fun initializeStatistic(
        @RequestParam startDate: Long,
        @RequestParam endDate: Long,
        request: HttpServletRequest
    ): ResponseEntity<Statistic> {
        val verifiedAccountDto = request.getAttribute("verifiedAccount") as VerifiedAccountDto

        val statisticData = statisticService.initializeStatistic(
            verifiedAccountDto = verifiedAccountDto,
            startDate = startDate,
            endDate = endDate
        )

        return if (statisticData != null) {
            ResponseEntity.ok(statisticData)
        } else {
            ResponseEntity.status(HttpStatus.NO_CONTENT).build()
        }
    }
}