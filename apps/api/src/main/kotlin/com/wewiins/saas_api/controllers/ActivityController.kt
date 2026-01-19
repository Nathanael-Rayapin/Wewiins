package com.wewiins.saas_api.controllers

import com.wewiins.saas_api.dto.ActivityRevenue
import com.wewiins.saas_api.dto.VerifiedAccount
import com.wewiins.saas_api.services.ActivityService
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
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

    @GetMapping("/revenue")
    fun getRevenueByAccountId(
        @RequestParam email: String,
        @RequestParam startDate: Long,
        @RequestParam endDate: Long,
        request: HttpServletRequest
    ): ResponseEntity<List<ActivityRevenue>> {
        val verifiedAccount = request.getAttribute("verifiedAccount") as VerifiedAccount

        val revenuesData = activityService.getRevenueByAccountId(
            connectedAccountId = verifiedAccount.stripe_connected_account_id,
            startDate = startDate,
            endDate = endDate
        )

        return ResponseEntity.ok(revenuesData)
    }
}