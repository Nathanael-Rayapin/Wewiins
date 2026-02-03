package com.wewiins.saas_api.controllers

import com.wewiins.saas_api.dto.VerifiedAccountDto
import com.wewiins.saas_api.interfaces.Dashboard
import com.wewiins.saas_api.interfaces.DashboardStatsComparison
import com.wewiins.saas_api.services.OrchestrationService
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/orchestration")
class OrchestrationController(
    private val orchestrationService: OrchestrationService,
) {
    @GetMapping("/initialize")
    fun initializeDashboard(
        @RequestParam startDate: Long,
        @RequestParam endDate: Long,
        request: HttpServletRequest
    ): ResponseEntity<Dashboard> {
        val verifiedAccountDto = request.getAttribute("verifiedAccount") as VerifiedAccountDto

        val dashboardData = orchestrationService.initializeDashboard(
            verifiedAccountDto = verifiedAccountDto,
            startDate = startDate,
            endDate = endDate
        )

        return if (dashboardData != null) {
            ResponseEntity.ok(dashboardData)
        } else {
            ResponseEntity.status(HttpStatus.NO_CONTENT).build()
        }
    }

    @GetMapping("/initialize/stats")
    fun initializeDashboardStatsComparison(
        @RequestParam startDate: Long,
        @RequestParam endDate: Long,
        request: HttpServletRequest
    ): ResponseEntity<DashboardStatsComparison> {
        val verifiedAccountDto = request.getAttribute("verifiedAccount") as VerifiedAccountDto

        val dashboardStatsComparisonData = orchestrationService.initializeDashboardStatsComparison(
            verifiedAccountDto = verifiedAccountDto,
            startDate = startDate,
            endDate = endDate
        )

        return if (dashboardStatsComparisonData != null) {
            ResponseEntity.ok(dashboardStatsComparisonData)
        } else {
            ResponseEntity.status(HttpStatus.NO_CONTENT).build()
        }
    }
}