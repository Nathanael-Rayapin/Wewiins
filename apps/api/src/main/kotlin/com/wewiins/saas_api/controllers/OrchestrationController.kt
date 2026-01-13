package com.wewiins.saas_api.controllers

import com.wewiins.saas_api.dto.Orchestration
import com.wewiins.saas_api.services.OrchestrationService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/orchestration")
class OrchestrationController(
    private val orchestrationService: OrchestrationService
) {
    @GetMapping("/initialize")
    fun initializeDashboard(
        @RequestParam email: String,
        @RequestParam startDate: Long,
        @RequestParam endDate: Long
    ): ResponseEntity<Orchestration> {
        val orchestrationData = orchestrationService.initializeDashboard(
            email = email,
            startDate = startDate,
            endDate = endDate
        )

        return if (orchestrationData != null) {
            ResponseEntity.ok(orchestrationData)
        } else {
            ResponseEntity.status(HttpStatus.NO_CONTENT).build()
        }
    }
}