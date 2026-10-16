-- Nara Ground volunteer portal — integration-layer schema
-- (PostgreSQL. This is the backend data layer connecting the Nara frontend,
--  built by a hackathon team, to campaign infrastructure — it is NOT the
--  frontend itself.)

-- volunteers table: new columns added to an existing volunteer-roster table
ALTER TABLE volunteers
  ADD COLUMN lane TEXT,                  -- Signal / Shield / Spark
  ADD COLUMN rank TEXT,                  -- Member / Steady Hand / Neighborhood Captain / District Builder / Constitution Keeper
  ADD COLUMN streak INTEGER DEFAULT 0,
  ADD COLUMN last_activity_date DATE,
  ADD COLUMN languages TEXT[];

CREATE TABLE magic_link_tokens (
  token UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  volunteer_id INTEGER REFERENCES volunteers(id),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE
);

CREATE TABLE volunteer_shifts (
  id SERIAL PRIMARY KEY,
  volunteer_id INTEGER REFERENCES volunteers(id),
  activity_type TEXT,
  lane TEXT,
  checked_in_at TIMESTAMPTZ,
  checked_out_at TIMESTAMPTZ,
  points_awarded INTEGER DEFAULT 0
);
