(function ($, $CU) {
    "use strict";

    function prepareConferencePickers() {
        var $conferenceDatePicker, slug, updateOptions;

        $conferenceDatePicker = $('#conference-date-picker');
        slug = $conferenceDatePicker.data('company-slug');

        updateOptions = function (dateText) {
            $CU.ajax('/a/scheduler/' + slug + '/',
                function (data) {
                    $('#conference-slot-options').optionPicker('set', data.options);
                },
                {'conference_date': dateText});
        };

        if (slug) {
            $conferenceDatePicker.datepicker({
                changeMonth: true,
                changeYear: true,
                dateFormat: "yy-mm-dd",
                onSelect: updateOptions
            });
            $conferenceDatePicker.datepicker("setDate", '+1d');

            $('#conference-slot-options').optionPicker({chosen: function (data) {
                $('#conference_time').val(data);
                $('#conference-time-form').show();
            }});
        }

        $('.conference-update-date-picker').datepicker({
            changeMonth: true,
            changeYear: true,
            dateFormat: "yy-mm-dd",
            onSelect: function (dateText) {
                var that = this;
                $CU.ajax('/a/scheduler/' + slug + '/',
                    function (data) {
                        $(that).closest('div.conference').find('.conference-update-slot-options').optionPicker('set', data.options);
                    },
                    {'conference_date': dateText});
            }
        });


        $('.conference-update-slot-options').optionPicker({chosen: function (data) {
            console.log(data);
        }});
    }

    function prepareConferenceInterface() {
        /**
         * Delete a conference after confirming the intention.
         */
        $('.conf-delete').click(function () {
            var confId, self, confirmed;
            self = $(this);
            confId = self.data("conf-id");

            confirmed = window.confirm("Are you sure you want to delete this conference? Everyone on the call will be notified.");
            if (confirmed) {
                $CU.ajax('/a/conf/' + confId + '/delete/', function () {
                    self.closest('.conference').slideUp('fast');
                });
            }

            return false;
        });

        $(".conf-info-update").click(function () {
            var self, confId, confDiv, cont, changes,
            // Dial in number field variables
                dialIn, dialInVal, oldDialInVal,
            // Access code field variables
                accessCode, accessCodeVal, oldAccessCodeVal,
            // Conference datetime field variables
                confDT, confDTVal, oldConfDTVal;

            self = $(this);
            confId = self.data("conf-id");
            confDiv = self.closest(".conference");

            dialIn = confDiv.find('.conf-dial-in');
            dialInVal = dialIn.val();
            oldDialInVal = dialIn.data('old-val');

            accessCode = confDiv.find('.conf-access-code');
            accessCodeVal = accessCode.val();
            oldAccessCodeVal = accessCode.data('old-val');

            confDT = confDiv.find('.conference-update-slot-options select');
            confDTVal = confDT.val();
            oldConfDTVal = confDiv.find('.conference-update-date-picker').data('old-val');

            changes = '';

            if (confDTVal !== oldConfDTVal && confDTVal !== '' && confDTVal !== undefined) {
                changes += '--- The conference date has changed from --- \n\n' + oldConfDTVal + '\n to \n' + confDT.find("option:selected").text() + '\n\n';
            }
            if (dialInVal !== oldDialInVal) {
                changes += '--- The dial in number has changed from --- \n\n' + oldDialInVal + '\n to \n' + dialInVal + '\n\n';
            }
            if (accessCodeVal !== oldAccessCodeVal) {
                changes += '--- The access code has changed from --- \n\n' + oldAccessCodeVal + '\n to \n' + accessCodeVal + '\n\n';
            }

            if (changes) {
                cont = confirm("Are you sure you want to make the following changes to the conference call?\n\n" +
                    changes +
                    "Everyone on the call will be notified via email of the new details.");
                if (!cont) {
                    return;
                }
            } else {
                alert("No changes to the selected conference detected. If you're trying to change the date, make sure " +
                    "you select a conference time as well.");
                return;
            }
            $CU.ajax('/a/conf/' + confId + '/update/', function () {
                $CU.displayInfo("Updated");
            }, {'dial_in_number': dialInVal,
                'access_code': accessCodeVal,
                'conf_dt': confDTVal});
            return false;
        });

        $CU.ajaxForm($('.conf-recording-add'), function (data) {
            $CU.displayInfo("Updated Conference Call with Recording");
        });
    }

    function prepareConferenceDetailsSave() {
        $CU.ajaxForm($('.conference_details_edit form.conference_details'), function (e) {
            $CU.displayInfo("Saved successfully");
        });

        $('.conference_details_edit form.conference_recording').on('submit', function (e) {
            // Upload recording to s3 endpoint, then copy
            var $form = $(this);
            $form.ajaxSubmit({
                dataType: 'json',
                iframe: 'true',
                success: function (data) {
                    var recording_save_endpoint = $form.data('href');
                    var conference_id = $form.data('cid');
                    $CU.ajax(recording_save_endpoint, function (data2) {
                        $form.closest('.conference_details_edit').find('.conference-recording-link').attr('href', data2.s3url).show();
                        $CU.displayInfo("Recording saved successfully.");
                    }, {
                        'conference_id': conference_id,
                        'bucket': data.obj.bucket,
                        'key': data.obj.key,
                        'etag': data.obj.etag,
                        's3url': data.obj.s3url,
                    });
                }
            });
            return false;
        });
    }

    $(function () {
        prepareConferencePickers();
        prepareConferenceInterface();
        prepareConferenceDetailsSave();
    });

}(window.jQuery, window.$CU));

