package com.wewiins.saas_api.controllers

import com.wewiins.saas_api.dto.ImageType
import com.wewiins.saas_api.dto.activity.ActivityDraftDto
import com.wewiins.saas_api.services.ActivityService
import org.slf4j.LoggerFactory
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/activity")
class ActivityController(
    private val activityService: ActivityService,
) {
    private val logger = LoggerFactory.getLogger(ActivityService::class.java)

    @PostMapping("/upload/images")
    fun uploadImage(
        @RequestParam("files") files: List<MultipartFile>,
        @RequestParam email: String,
        @RequestParam imageType: ImageType,
        @RequestParam activityName: String? = null
    ): List<String> {
        return activityService.uploadImages(files, email, imageType, activityName)
    }

    @PostMapping("/draft")
    fun saveDraft(@RequestBody dto: ActivityDraftDto): Unit {
        logger.info("Draft received : {}", dto)
    }

}