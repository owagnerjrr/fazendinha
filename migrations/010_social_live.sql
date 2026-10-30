BEGIN;
CREATE TABLE IF NOT EXISTS farm_presence (
 user_id text PRIMARY KEY REFERENCES farms(user_id),owner_id text NOT NULL REFERENCES farms(user_id),
 x double precision NOT NULL,y double precision NOT NULL,direction integer NOT NULL CHECK(direction BETWEEN 0 AND 3),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS farm_presence_owner_idx ON farm_presence(owner_id,updated_at);
CREATE TABLE IF NOT EXISTS social_notifications (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,user_id text NOT NULL REFERENCES farms(user_id),
 actor_id text NOT NULL REFERENCES farms(user_id),kind text NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),read_at timestamptz
);
CREATE INDEX IF NOT EXISTS social_notifications_unread_idx ON social_notifications(user_id,id) WHERE read_at IS NULL;
CREATE OR REPLACE FUNCTION notify_friendship_change() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_temp AS $$
DECLARE s text;r text;k text;
BEGIN
 IF TG_OP='DELETE' THEN s:=OLD.sender;r:=OLD.recipient;k:=CASE WHEN OLD.accepted THEN 'friend_removed' ELSE 'friend_closed' END;
 ELSE s:=NEW.sender;r:=NEW.recipient;k:=CASE WHEN NEW.accepted THEN 'friend_accepted' ELSE 'friend_requested' END; END IF;
 IF TG_OP='UPDATE' AND OLD.accepted=NEW.accepted THEN RETURN NEW; END IF;
 INSERT INTO social_notifications(user_id,actor_id,kind) VALUES(r,s,k),(s,r,CASE WHEN TG_OP='INSERT' THEN 'friend_sent' ELSE k END);
 RETURN NULL;
END $$;
DROP TRIGGER IF EXISTS friendship_notification ON friendships;
CREATE TRIGGER friendship_notification AFTER INSERT OR UPDATE OR DELETE ON friendships FOR EACH ROW EXECUTE FUNCTION notify_friendship_change();
CREATE OR REPLACE FUNCTION notify_friend_message() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_temp AS $$
BEGIN INSERT INTO social_notifications(user_id,actor_id,kind) VALUES(NEW.recipient,NEW.sender,'message');RETURN NEW;END $$;
DROP TRIGGER IF EXISTS message_notification ON friend_messages;
CREATE TRIGGER message_notification AFTER INSERT ON friend_messages FOR EACH ROW EXECUTE FUNCTION notify_friend_message();
COMMIT;
