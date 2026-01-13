package com.wewiins.saas_api.controllers

import com.wewiins.saas_api.dto.ActivityRevenue
import com.wewiins.saas_api.services.ActivityService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/activity")
class ActivityController(
    private val activityService: ActivityService
) {

    @GetMapping("/revenue/{connectedAccountId}")
    fun getRevenueByAccountId(
        @PathVariable connectedAccountId: String,
        @RequestParam startDate: Long,
        @RequestParam endDate: Long
    ): List<ActivityRevenue> {
        return activityService.getRevenueByAccountId(connectedAccountId, startDate, endDate)
    }
}