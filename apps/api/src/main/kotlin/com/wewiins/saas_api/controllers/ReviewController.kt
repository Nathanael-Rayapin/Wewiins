package com.wewiins.saas_api.controllers

import com.wewiins.saas_api.dto.VerifiedAccountDto
import com.wewiins.saas_api.interfaces.Review
import com.wewiins.saas_api.services.ReviewService
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/review")
class ReviewController(
    private val reviewService: ReviewService,
) {
    @GetMapping("/initialize")
    fun initializeReview(
        @RequestParam startDate: Long,
        @RequestParam endDate: Long,
        @RequestParam page: Int,
        @RequestParam pageSize: Int,
        request: HttpServletRequest
    ): ResponseEntity<Review> {
        val verifiedAccountDto = request.getAttribute("verifiedAccount") as VerifiedAccountDto

        val reviewData = reviewService.initializeReview(
            verifiedAccountDto = verifiedAccountDto,
            startDate = startDate,
            endDate = endDate,
            page = page,
            pageSize = pageSize,
        )

        return if (reviewData != null) {
            ResponseEntity.ok(reviewData)
        } else {
            ResponseEntity.status(HttpStatus.NO_CONTENT).build()
        }
    }
}