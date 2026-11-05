import datetime, json, os, time, urllib.request

last_success = None
while True:
    if os.environ.get('REGEN_SCHEDULER_ENABLED') == 'true':
        now = datetime.datetime.now(datetime.timezone.utc)
        if last_success is None or now.date() != last_success:
            request = urllib.request.Request(
                'http://website:3000/api/cron/regen-mail',
                headers={'Authorization': 'Bearer ' + os.environ['CRON_SECRET']})
            try:
                with urllib.request.urlopen(request, timeout=60) as response:
                    result = json.load(response)
                if result.get('scheduled'):
                    last_success = now.date()
                print(json.dumps({'mail_schedule_ready': bool(result.get('scheduled'))}), flush=True)
            except Exception as error:
                print(json.dumps({'mail_schedule_ready': False, 'error_type': type(error).__name__}), flush=True)
    time.sleep(60)
