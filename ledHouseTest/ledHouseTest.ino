int led = 8;
String val;

void setup() {
pinMode(led, OUTPUT);
Serial.begin(9600);
}
 
void loop() {
  if(Serial.available() > 0) {
    val = Serial.read();
    if (val.toInt() < 20) {
      digitalWrite(led, HIGH);
    } else {
      digitalWrite(led, LOW);
    }
    Serial.println(val);
    
  }



}
